package handlers

import (
	"context"
	"errors"

	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/hendrik-the-ee/irrigationSys/models"
)

type WeatherData struct {
	gbq *clients.Bigquery
	bc  *clients.Bloomsky
}

func NewWeather(bc *clients.Bloomsky, gbq *clients.Bigquery) *WeatherData {
	return &WeatherData{
		gbq: gbq,
		bc:  bc,
	}
}

func (h *WeatherData) CollectData(ctx context.Context) error {
	data, err := h.bc.GetData()
	if err != nil {
		return err
	}

	// TODO: validate data
	if !data.IsValid() {
		return errors.New("invalid data received from bloomsky")
	}

	return h.gbq.InsertRows(ctx, []*models.BloomskyData{&data})
}
