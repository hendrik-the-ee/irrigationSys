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
	BucketName  string `envconfig:"BUCKET_NAME" required:"true"`
	GoogleCreds string `envconfig:"GOOGLE_APPLICATION_CREDENTIALS" required:"true"`
	BloomskyURL string `envconfig:"BLOOMSKY_URL" default:""`
	BloomskyKey string `envconfig:"BLOOMSKY_KEY" required:"true"`
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
	gcs := clients.NewCloudStorage(WeatherDataBucketName, gcp)

	bc := clients.NewBloomsky(config.BloomskyURL, config.BloomskyKey)

	h := handlers.New(dm, gcs, bc, hlog)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.GetAndStoreData).Methods("GET")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	hlog.Info("Listening on port :8060")
	hlog.Fatal(http.ListenAndServe(":8060", router))
}
