package main

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/storage"
	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/hendrik-the-ee/irrigationSys/datamanager"
	"github.com/hendrik-the-ee/irrigationSys/handlers"
	"github.com/hendrik-the-ee/irrigationSys/hydrolog"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Filepath   string `envconfig:"FILE_STORAGE_PATH" required:"true"`
	BucketName string `envconfig:"BUCKET_NAME" required:"true"`
}

func main() {
	hlog, err := hydrolog.New("collector")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	ctx := context.Background()

	var config Config
	err = envconfig.Process("collector", &config)

	dm := datamanager.New(config.Filepath)
	gcp, err := storage.NewClient(ctx)
	if err != nil {
		hlog.Fatal("couldn't create google storage client")
	}

	gcs := clients.NewCloudStorage(config.BucketName, gcp)

	h := handlers.New(dm, gcs, hlog, config.Filepath)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.CollectData).Methods("POST")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	hlog.Info("Listening on port :8080")
	hlog.Fatal(http.ListenAndServe(":8080", router))
}
