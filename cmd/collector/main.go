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
	"google.golang.org/api/option"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	GoogleCreds string `envconfig:"GOOGLE_APPLICATION_CREDENTIALS" required:"true"`
}

func main() {
	hlog, err := hydrolog.New("collector")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	ctx := context.Background()

	var config Config
	err = envconfig.Process("collector", &config)

	dm := datamanager.New()

	gcp, err := storage.NewClient(ctx, option.WithCredentialsFile(config.GoogleCreds))
	if err != nil {
		hlog.Fatalf("couldn't create google storage client: %v", err)
	}
	gcs := clients.NewCloudStorage(SensorDataBucketName, gcp)

	h := handlers.NewSensorCollector(dm, gcs, hlog)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.CollectData).Methods("POST")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	hlog.Info("Listening on port :8080")
	hlog.Fatal(http.ListenAndServe(":8080", router))
}
