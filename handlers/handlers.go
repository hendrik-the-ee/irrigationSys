package handlers

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/hendrik-the-ee/irrigationSys/datamanager"
	"github.com/hendrik-the-ee/irrigationSys/models"
	"github.com/sirupsen/logrus"
)

const (
	FileUploadFrequency  = 12 * time.Hour
	SensorDataFilepath   = "sensor_data.csv"
	SensorDataBucketName = "hydrobot-sensor-data"
)

type Handler struct {
	dm             *datamanager.Client
	gcs            *clients.CloudStorage
	log            *logrus.Entry
	lastUploadTime time.Time
}

func New(dm *datamanager.Client, gcs *clients.CloudStorage, log *logrus.Entry) *Handler {
	return &Handler{
		dm:             dm,
		gcs:            gcs,
		bc:             bc,
		log:            log,
		lastUploadTime: time.Now().UTC(),
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
		"user_agent":       r.Header["User-Agent"],
		"sensor_id":        sd.SensorID,
		"sensor_type":      sd.SensorType,
		"soil_temp":        sd.SoilTemp,
		"soil_moisture":    sd.SoilMoisture,
		"volts_in":         sd.VoltsIn,
		"created_at":       sd.CreatedAt.Format(models.Layout),
		"last_upload_time": h.lastUploadTime,
	}

	log.WithFields(fields).Info("data received")

	if err := h.dm.AppendToFile(&sd, SensorDataFilepath); err != nil {
		fields := logrus.Fields{
			"filepath":         SensorDataFilepath,
			"last_upload_time": h.lastUploadTime,
		}
		log.WithFields(fields).Errorf("error saving data: %v", err)
		// TODO: create a passive nagios check to alert on this failing
		return
	}

	ctx := context.Background()

	if h.shouldUploadFile() {
		fields := logrus.Fields{
			"src_filepath":     SensorDataFilepath,
			"last_upload_time": h.lastUploadTime,
		}

		if err := h.gcs.UploadToStorage(SensorDataFilepath, ctx); err != nil {
			log.WithFields(fields).Errorf("error uploading data: %v", err)
			return
		}

		if err := h.dm.ArchiveFile(SensorDataFilepath); err != nil {
			log.WithFields(fields).Errorf("error resetting file: %v", err)
			return
		}

		h.lastUploadTime = time.Now().UTC()

	}

	json.NewEncoder(w).Encode("OK")
}

func (h *Handler) shouldUploadFile() bool {
	return time.Since(h.lastUploadTime) >= FileUploadFrequency
}
