package handlers

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
)

type Handler struct {
	ds *datastorage.Client
}

func New(ds *datastorage.Client) *Handler {
	return &Handler{
		ds: ds,
	}
}

func (h *Handler) CollectData(w http.ResponseWriter, r *http.Request) {
	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("error reading data")
		log.Fatal(err)
	}

	var sensorData models.SensorData
	if err := json.Unmarshal(b, &sensorData); err != nil {
		// handle error
		log.Println("error unmarshaling data")
		log.Fatal(err)
	}

	log.Printf("storing data: %+v", sensorData)

	// TODO: handle missing data
	// and confirm data formats (ex. floats?)

	if err := h.ds.Save(&sensorData); err != nil {
		log.Print("error saving data")
		log.Fatal(err)
	}

	json.NewEncoder(w).Encode("OK")
}

func (h *Handler) Ping(w http.ResponseWriter, r *http.Request) {
	log.Printf("%+v\n", r.Body)
	json.NewEncoder(w).Encode("OK")
}
