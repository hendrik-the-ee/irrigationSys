package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	ds  *datastorage.Client
	log *logrus.Entry
}

func New(ds *datastorage.Client, log *logrus.Entry) *Handler {
	return &Handler{
		ds:  ds,
		log: log,
	}
}

func (h *Handler) Ping(w http.ResponseWriter, r *http.Request) {
	h.log.WithFields(logrus.Fields{"user_agent": r.Header["User-Agent"]}).Info("ping")
	json.NewEncoder(w).Encode("OK")
}

func (h *Handler) CollectData(w http.ResponseWriter, r *http.Request) {
	log := h.log

	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.WithFields(logrus.Fields{
			"user_agent":   r.Header["User-Agent"],
			"request_body": string(b),
		}).Errorf("error reading body: %v", err)
	}

	var sd models.SensorData
	if err := json.Unmarshal(b, &sd); err != nil {
		// handle error
		log.WithFields(logrus.Fields{
			"user_agent":   r.Header["User-Agent"],
			"request_body": string(b),
		}).Errorf("error unmarshaling body: %v", err)
	}

	fields := logrus.Fields{
		"user_agent":    r.Header["User-Agent"],
		"sensor_id":     sd.SensorID,
		"sensor_type":   sd.SensorType,
		"soil_temp":     sd.SoilTemp,
		"soil_moisture": sd.SoilMoisture,
		"volts_in":      sd.VoltsIn,
	}

	if err := h.ds.Save(&sd); err != nil {
		log.WithFields(fields).Errorf("error saving data: %v", err)
	}

	json.NewEncoder(w).Encode("OK")
}
