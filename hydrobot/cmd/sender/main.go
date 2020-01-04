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
	"github.com/hendrik-the-ee/hydrobot/hydrobot/hydrolog"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/clients"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

func main() {
	hlog, err := hydrolog.New("sender")
	if err != nil {
		log.Fatal("error creating logger")
	}

	bucketName := os.Getenv("BUCKET_NAME")
	if bucketName == "" {
		log.Fatal("no bucket name supplied")
	}

	ctx := context.Background()

	gcp, err := storage.NewClient(ctx)
	if err != nil {
		hlog.Fatal("couldn't create google storage client")
	}
	gcs := clients.NewCloudStorage(bucketName, gcp)

	sqlite, err := sql.Open("sqlite3", models.DefaultDBName)
	if err != nil {
		hlog.Fatalf("error opening db: %v", err)
	}
	defer sqlite.Close()

	ds := datastorage.New(sqlite)

	hlog.Debug("getting data")

	// get get all data from local db
	data, err := ds.GetAll()
	if err != nil {
		hlog.Errorf("error getting data: %v", err)
	}

	if len(data) == 0 {
		hlog.Info("no records found")
		return
	}

	filename := fmt.Sprintf("%s.csv", time.Now().UTC().Format(models.Layout))
	file, err := os.Create(filename)

	var startTS time.Time
	var endTS time.Time
	switch {
	case len(data) == 1:
		startTS = data[0].CreatedAt
		endTS = data[0].CreatedAt
	case len(data) > 1:
		startTS = data[0].CreatedAt
		endTS = data[len(data)-1].CreatedAt
	default:
	}

	fields := logrus.Fields{
		"file":        filename,
		"num_records": len(data),
		"start_ts":    startTS,
		"end_ts":      endTS,
	}

	recordsToDelete, err := writeDataToCSV(file, data)
	if err != nil {
		hlog.WithFields(fields).Errorf("error creating csv file: %v", err)
	}

	if err := gcs.UploadToStorage(filename, ctx); err != nil {
		hlog.WithFields(fields).Errorf("error uploading data to gcs: %v", err)
	}

	// delete local csv file
	err = os.Remove(filename)
	if err != nil {
		hlog.WithFields(fields).Errorf("error removing temp csv file: %v", err)
	}

	// if data is successfully sent, mark as deletable
	hlog.WithFields(fields).Info("marking data as deletable")

	if err := ds.MarkAsDeleted(recordsToDelete); err != nil {
		hlog.WithFields(fields).Errorf("error marking data as deleted: %v", err)
	}
}

func writeDataToCSV(file *os.File, data []*models.SensorData) ([]int32, error) {
	csvWriter := csv.NewWriter(file)
	if err := csvWriter.Write(models.GetColumnHeaders()); err != nil {
		return nil, err
	}

	var ids []int32
	for _, d := range data {
		csvWriter.Write(d.ToCSVRecord())
		ids = append(ids, d.ID)
	}

	csvWriter.Flush()

	return ids, nil
}
