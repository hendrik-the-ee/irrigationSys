package main

import (
	"context"
	"log"
	"net/http"
	"os"

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
	Filepath       string `envconfig:"FILE_STORAGE_PATH" required:"true"`
	BucketName     string `envconfig:"BUCKET_NAME" required:"true"`
	GoogleCreds    string `envconfig:"GOOGLE_APPLICATION_CREDENTIALS" required:"true"`
	SendgridAPIKey string `envconfig:"SENDGRID_API_KEY" required:"true"`
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

	gcp, err := storage.NewClient(ctx, option.WithCredentialsFile(config.GoogleCreds))
	if err != nil {
		hlog.Fatalf("couldn't create google storage client: %v", err)
	}
	gcs := clients.NewCloudStorage(config.BucketName, gcp)

	key := os.Getenv("SENDGRID_API_KEY")
	fromEmail := os.Getenv("FROM_EMAIL")
	toEmail := os.Getenv("TO_EMAIL")
	ccEmail := os.Getenv("CC_EMAIL")
	email := clients.NewEmail(key, fromEmail, toEmail, ccEmail)

	h := handlers.NewSensorData(dm, gcs, email, hlog, config.Filepath)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.CollectData).Methods("POST")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	hlog.Info("Listening on port :8080")
	hlog.Fatal(http.ListenAndServe(":8080", router))
}
