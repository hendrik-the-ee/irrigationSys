package clients

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hendrik-the-ee/irrigationSys/models"
)

type WeatherData interface {
	GetData() (models.BloomskyData, error)
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

func (b *Bloomsky) GetData() (models.BloomskyData, error) {
	var data models.BloomskyData

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

	var tmpData []models.BloomskyData
	if err := json.Unmarshal(body, &tmpData); err != nil {
		return data, err
	}

	if len(tmpData) != 1 {
		return data, fmt.Errorf("expected 1 bloomsky data point, got %d", len(tmpData))
	}

	data = tmpData[0]

	return data, nil
}
