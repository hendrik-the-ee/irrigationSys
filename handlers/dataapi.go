package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/sirupsen/logrus"
)

// Summary represents the device summary in the dashboard.
type Summary struct {
	ID           string  `json:"id"`
	Category     string  `json:"category"`
	Controller   string  `json:"controller"`
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

type ResponseOne struct {
	Data Data `json:"data"`
}

type ResponseMany struct {
	Data []*Data `json:"data"`
}

type Data struct {
	ID         string      `json:"id"`
	Attributes interface{} `json:"attributes"`
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
	// query := "SELECT * FROM `%s` WHERE CreatedAt >= Timestamp(DATE_ADD(CURRENT_DATE(), INTERVAL -7 DAY)) ORDER BY CreatedAt;"
	// iterator, err := h.bqClient.QueryTable(context.Background, query)
	// if err != nil {
	// 	// write error response
	// }

	// iterate through results
	// calculate values for dashboard
	// write response

	// success response
	response := ResponseMany{
		Data: []*Data{
			{
				ID: "1",
				Attributes: Summary{
					Category:     "testCategory",
					Controller:   "testController",
					CurrentVolts: 1.5,
					Status:       "down",
				},
			},
		},
	}
	json.NewEncoder(w).Encode(response)
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
