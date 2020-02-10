package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/hendrik-the-ee/irrigationSys/datamanager"
	"github.com/hendrik-the-ee/irrigationSys/models"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	dm  *datamanager.Client
	log *logrus.Entry
}

func New(dm *datamanager.Client, log *logrus.Entry) *Handler {
	return &Handler{
		dm:  dm,
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
		return
	}

	var sd models.SensorData
	if err := json.Unmarshal(b, &sd); err != nil {
		log.WithFields(logrus.Fields{
			"user_agent":   r.Header["User-Agent"],
			"request_body": string(b),
		}).Errorf("error unmarshaling body: %v", err)
		return
	}

	sd.CreatedAt = time.Now().UTC()

	fields := logrus.Fields{
		"user_agent":    r.Header["User-Agent"],
		"sensor_id":     sd.SensorID,
		"sensor_type":   sd.SensorType,
		"soil_temp":     sd.SoilTemp,
		"soil_moisture": sd.SoilMoisture,
		"volts_in":      sd.VoltsIn,
		"created_at":    sd.CreatedAt.Format(models.Layout),
	}

	log.WithFields(fields).Info("data received")

	if _, err := h.dm.AppendToFile(&sd); err != nil {
		log.WithFields(fields).Errorf("error saving data: %v", err)
		// TODO: create a passive nagios check to alert on this failing
		return
	}

	json.NewEncoder(w).Encode("OK")
}
