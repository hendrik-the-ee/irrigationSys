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
		// handle error
		log.Fatal(err)
	}

	var sensorData models.SensorData
	if err := json.Unmarshal(b, &sensorData); err != nil {
		// handle error
		log.Fatal(err)
	}

	// TODO: handle missing data
	// and confirm data formats (ex. floats?)

	if err := h.ds.Save(&sensorData); err != nil {
		// handle error
		log.Fatal(err)
	}

	json.NewEncoder(w).Encode("OK")
}

func (h *Handler) Ping(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode("OK")
}
