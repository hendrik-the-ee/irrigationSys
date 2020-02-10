package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/hendrik-the-ee/irrigationSys/datamanager"
	"github.com/hendrik-the-ee/irrigationSys/hydrolog"
	"github.com/sirupsen/logrus"
)

func main() {
	hlog, err := hydrolog.New("sender")
	if err != nil {
		log.Fatal("error creating logger")
	}

	bucketName := os.Getenv("BUCKET_NAME")
	if bucketName == "" {
		hlog.Fatal("no bucket name supplied")
	}

	filepath := os.Getenv("FILEPATH")
	if filepath == "" {
		hlog.Fatal("no filepath supplied")
	}

	ctx := context.Background()

	gcp, err := storage.NewClient(ctx)
	if err != nil {
		hlog.Fatal("couldn't create google storage client")
	}
	gcs := clients.NewCloudStorage(bucketName, gcp)

	dm := datamanager.New(filepath)

	hlog.Debug("getting data")

	fields := logrus.Fields{
		"file": filepath,
	}

	if err := gcs.UploadToStorage(filepath, ctx); err != nil {
		hlog.WithFields(fields).Errorf("error uploading data to gcs: %v", err)
	}

	deleteOld := true
	archiveFileName := fmt.Sprintf("archive_%v.csv", time.Now().UTC())
	if err := dm.CreateCopy(archiveFileName, deleteOld); err != nil {
		hlog.WithFields(fields).Errorf("error archiving file: %v", err)
	}
}
