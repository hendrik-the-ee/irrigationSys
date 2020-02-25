package models

import (
	"fmt"
	"time"
)

const (
	Layout = "2006-01-02 15:04:05"
)

type SensorData struct {
	SensorID     int32     `json:"sensor_id"`
	SensorType   string    `json:"sensor_type"`
	SoilTemp     float32   `json:"temp"`
	SoilMoisture float32   `json:"moist"`
	VoltsIn      float32   `json:"volts_in"`
	CreatedAt    time.Time `json:"created_at,omitempty"`
}

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
	sensorID := fmt.Sprintf("%d", s.SensorID)
	return []string{
		sensorID,
		s.SensorType,
		soilTemp,
		soilMoist,
		voltsIn,
		createdAt,
	}
}
