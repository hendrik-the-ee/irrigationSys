package models

import (
	"fmt"
	"time"
)

type SensorData struct {
	SensorID     string    `json:"sensor_id"`
	SensorType   string    `json:"sensor_type"`
	SoilTemp     float32   `json:"temp"`
	SoilMoisture float32   `json:"moist"`
	VoltsIn      float32   `json:"volts_in"`
	CreatedAt    time.Time `json:"created_at"`
}

const Layout = "2006-01-02 15:04:05"

func GetColumnHeaders() []string {
	return []string{
		"SensorID",
		"SensorType",
		"SoilTemp",
		"SoilMoisture",
		"VoltsIn",
		"CreatedAt",
	}
}

func (s *SensorData) ToCSVRecord() []string {
	soilTemp := fmt.Sprintf("%f", s.SoilTemp)
	soilMoist := fmt.Sprintf("%f", s.SoilMoisture)
	voltsIn := fmt.Sprintf("%f", s.VoltsIn)
	createdAt := s.CreatedAt.Format(Layout)
	return []string{
		s.SensorID,
		s.SensorType,
		soilTemp,
		soilMoist,
		voltsIn,
		createdAt,
	}
}
