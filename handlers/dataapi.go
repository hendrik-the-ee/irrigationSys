package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/sirupsen/logrus"
)

// Summary represents the device summary in the dashboard.
type Summary struct {
	SensorID     string  `json:"id"`
	SensorType   string  `json:"category"`
	ReportLag    int     `json:"report_lag"`
	CurrentVolts float64 `json:"current_volts"`
	Status       string  `json:"status"`
}

// Volt represents the volt data displayed in the dashboard.
type Volt struct {
	Value     float64   `json:"y_value"`
	Timestamp time.Time `json:"-"`
	Datetime  string    `json:x_value"`
}

// Detail represents the detail view for the device in the dashboard.
type Detail struct {
	Summary Summary `json:"summary"`
	Volts   []*Volt `json:"volts"`
	// SoilTemp []*SoilTemp
	// SoilMoisture []*SoilMoisture
}

type DataAPI struct {
	bqClient *clients.Bigquery
	log      *logrus.Entry
}

func NewDataAPI(bq *clients.Bigquery, log *logrus.Entry) *DataAPI {
	return &DataAPI{
		bqClient: bq,
		log:      log,
	}
}

// handler to get device summary
func (h *DataAPI) GetDevices(w http.ResponseWriter, r *http.Request) {
	// validate request
	// devices, err := h.bqClient.GetDevices()
	// if err != nil {
	// 	// write error response
	// }

	// success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "/devices")
}

// handler to get device details
func (h *DataAPI) GetDevice(w http.ResponseWriter, r *http.Request) {
	// validate request
	// get sensor id from request
	// var sensorID string
	// device, err := h.bqClient.GetDevice(sensorID)
	// if err != nil {
	// 	// write error response
	// }

	// success response
	vars := mux.Vars(r)
	w.WriteHeader(http.StatusOK)

	fmt.Fprintf(w, "Sensor ID: %v\n", vars["sensor_id"])
}
