package clients

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type WeatherData interface {
	GetData() (BloomskyData, error)
}

type Bloomsky struct {
	url        string
	key        string
	httpClient http.Client
}

func NewBloomsky(url, key string) *Bloomsky {
	return &Bloomsky{
		url:        url,
		key:        key,
		httpClient: http.Client{},
	}
}

// BloomskyData represents the data returned by the Bloomsky device API:
// http://weatherlution.com/bloomsky-api/
type BloomskyData struct {
	DeviceID   string  `json:"DeviceID"`
	DeviceName string  `json:"DeviceName"`
	Lat        float64 `json:"LAT"`
	Lon        float64 `json:"LON"`
	Alt        float64 `json:"ALT"` // elevation in meters
	TS         int64   `json:"TS"`
	Details    Detail  `json:"Data"`
}

// Detail represents the data returned by the Bloomsky device API:
// http://weatherlution.com/bloomsky-api/
type Detail struct {
	Temperature float64 `json:"Temperature"`
	Humidity    int     `json:"Humidity"`
	// intensity of ilght emitted from surface per unit area in a given direction
	Luminance int     `json:"Luminance"`
	Rain      bool    `json:"Rain"`
	Pressure  float64 `json:"Pressure"`
	Voltage   int     `json:"Voltage"`
	UVIndex   int     `json:"UVIndex"`
}

func (b *Bloomsky) GetData() (BloomskyData, error) {
	var data BloomskyData

	req, err := http.NewRequest("GET", b.url, nil)
	if err != nil {
		return data, err
	}

	req.Header.Add("Authorization", b.key)

	resp, err := b.httpClient.Do(req)
	if err != nil {
		return data, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return data, err
	}

	var tmpData []BloomskyData
	if err := json.Unmarshal(body, &tmpData); err != nil {
		return data, err
	}

	if len(tmpData) != 1 {
		return data, fmt.Errorf("expected 1 bloomsky data point, got %d", len(tmpData))
	}

	data = tmpData[0]

	return data, nil
}
