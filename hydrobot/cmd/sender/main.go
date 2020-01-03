package main

import (
	"context"
	"database/sql"
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/clients"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	bucketName := os.Getenv("BUCKET_NAME")
	if bucketName == "" {
		log.Fatal("no bucket name supplied")
	}

	ctx := context.Background()

	gcp, err := storage.NewClient(ctx)
	if err != nil {
		return err
	}
	gcs := clients.NewCloudStorage(bucketName, gcp)

	sqlite, err := sql.Open("sqlite3", models.DefaultDBName)
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

	filename := fmt.Sprintf("%s.csv", time.Now().UTC().Format(models.Layout))
	file, err := os.Create(filename)

	recordsToDelete, err := writeDataToCSV(file, data)
	if err != nil {
		log.Fatalf("error creating csv file: %v", err)
	}

	if err := gcs.UploadToStorage(filename, ctx); err != nil {
		log.Fatalf("error uploading data to gcs: %v", err)
	}

	// delete local csv file
	err = os.Remove(filename)
	if err != nil {
		log.Printf("error removing temp csv file: %v", err)
	}

	// if data is successfully sent, mark as deletable
	log.Print("marking data as deletable")

	if err := ds.MarkAsDeleted(recordsToDelete); err != nil {
		log.Printf("error marking data as deleted: %v", err)
	}
}

func writeDataToCSV(file *os.File, data []*models.SensorData) ([]int32, error) {
	csvWriter := csv.NewWriter(file)
	if err := csvWriter.Write(models.GetColumnHeaders()); err != nil {
		return nil, err
	}

	var recordsToDelete []int32
	for _, d := range data {
		csvWriter.Write(d.ToCSVRecord())
		recordsToDelete = append(recordsToDelete, d.ID)
	}

	csvWriter.Flush()

	return recordsToDelete, nil
}
