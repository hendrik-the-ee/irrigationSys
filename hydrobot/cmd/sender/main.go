package main

import (
	"context"
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	projectID := os.Getenv("PROJECT_ID")
	if projectID == "" {
		log.Fatal("no project id supplied")
	}

	bucketName := os.Getenv("BUCKET_NAME")
	if bucketName == "" {
		log.Fatal("no bucket name supplied")
	}

	sqlite, err := sql.Open("sqlite3", "./hydrobot.db")
	if err != nil {
		log.Fatalf("error opening db: %v", err)
	}
	defer sqlite.Close()

	ds := datastorage.New(sqlite)

	log.Print("getting data")

	// get get all data from local db
	data, err := ds.GetAll()
	if err != nil {
		log.Fatalf("error getting data: %v", err)
	}

	// write data to csv file
	filename := fmt.Sprintf("%s.csv", time.Now().UTC().Format(models.Layout))
	file, err := os.Create(filename)

	csvWriter := csv.NewWriter(file)
	csvWriter.Write(models.GetColumnHeaders())
	for _, d := range data {
		log.Printf("writing: %v", d)
		csvWriter.Write(d.ToCSVRecord())
	}

	csvWriter.Flush()

	err = uploadData(context.Background(), filename)
	if err != nil {
		log.Fatalf("error uploading data to gcs: %v", err)
	}

	// delete local csv file
	err = os.Remove(filename)
	if err != nil {
		log.Printf("error removing temp csv file: %v", err)
	}

	// delete db rows
	log.Print("deleting data")

	// if all data is successfully sent, trucate table
	if err := ds.DeleteAll(); err != nil {
		log.Printf("error deleting all data: %v", err)
	}
}

func uploadData(ctx context.Context, filename string) error {
	f, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	client, err := storage.NewClient(ctx)
	if err != nil {
		return err
	}

	bh := client.Bucket(BucketName)
	// Check if the bucket exists
	if _, err = bh.Attrs(ctx); err != nil {
		return err
	}

	obj := bh.Object(filename)
	w := obj.NewWriter(ctx)

	if _, err := io.Copy(w, f); err != nil {
		return err
	}
	if err := w.Close(); err != nil {
		return err
	}

	return nil
}
