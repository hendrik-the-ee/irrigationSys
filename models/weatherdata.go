package models

import (
	"fmt"

	"cloud.google.com/go/bigquery"
)

type Detail struct {
	Temperature float64 `json:"Temperature"`
	Humidity    int     `json:"Humidity"`
	// intensity of ilght emitted from surface per unit area in a given direction
	Luminance int     `json:"Luminance"`
	Rain      bool    `json:"Rain"`
	Pressure  float64 `json:"Pressure"`
	Voltage   int     `json:"Voltage"`
	UVIndex   int     `json:"UVIndex"`
	TS        int64   `json:"TS"`
}

type BloomskyData struct {
	DeviceID   string  `json:"DeviceID"`
	DeviceName string  `json:"DeviceName"`
	Lat        float64 `json:"LAT"`
	Lon        float64 `json:"LON"`
	Alt        float64 `json:"ALT"` // elevation in meters
	Details    Detail  `json:"Data"`
}

func (b BloomskyData) IsValid() bool {
	// TODO: Implement checks on data
	return true
}

// Save implements the bigquery ValueSaver interface
// https://godoc.org/cloud.google.com/go/bigquery#ValueSaver
func (b *BloomskyData) Save() (map[string]bigquery.Value, string, error) {
	row := map[string]bigquery.Value{
		"device_id":   b.DeviceID,
		"device_name": b.DeviceName,
		"lat":         b.Lat,
		"lon":         b.Lon,
		"elevation":   b.Alt,
		"timestamp":   b.Details.TS,
		"temperature": b.Details.Temperature,
		"humidity":    b.Details.Humidity,
		"lumiance":    b.Details.Luminance,
		"rain":        b.Details.Rain,
		"pressure":    b.Details.Pressure,
		"voltage":     b.Details.Voltage,
		"uv_index":    b.Details.UVIndex,
	}

	insertID := fmt.Sprintf("%d", b.Details.TS)
	return row, insertID, nil
}
