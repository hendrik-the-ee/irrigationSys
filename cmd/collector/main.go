package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/irrigationSys/datamanager"
	"github.com/hendrik-the-ee/irrigationSys/handlers"
	"github.com/hendrik-the-ee/irrigationSys/hydrolog"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Filepath string `envconfig:"FILE_STORAGE_PATH" required:"true"`
}

func main() {
	hlog, err := hydrolog.New("collector")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	var config Config
	err = envconfig.Process("collector", &config)

	dm := datamanager.New(config.Filepath)
	h := handlers.New(dm, hlog)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.CollectData).Methods("POST")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	hlog.Info("Listening on port :8080")
	hlog.Fatal(http.ListenAndServe(":8080", router))
}
