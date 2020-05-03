package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/hendrik-the-ee/irrigationSys/handlers"
	"github.com/hendrik-the-ee/irrigationSys/hydrolog"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ProjectID string `envconfig:"PROJECT_ID"` //required:"true"`
	TableID   string `envconfig:"TABLE_ID"`   //required:"true"`
	DatasetID string `envconfig:"DATASET_ID"` //required:"true"`
}

func main() {
	hlog, err := hydrolog.New("data-api")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	var config Config
	err = envconfig.Process("data-api", &config)
	if err != nil {
		hlog.Fatalf("error processing config: %v", err)
	}

	bq := clients.NewBigquery(config.ProjectID, config.DatasetID, config.TableID)

	h := handlers.NewDataAPI(bq, hlog)

	hlog.Info("starting data api server")

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/devices", h.GetDevices).Methods("GET")
	router.HandleFunc("/devices/{sensor_id}", h.GetDevice).Methods("GET")

	log.Fatal(http.ListenAndServe(":8080", router))

	//	ctx, _ := context.WithCancel(context.Background())

}
