package handlers

import (
	"context"

	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/sirupsen/logrus"
)

type WeatherData struct {
	log *logrus.Entry
	gbq *clients.Bigquery
	bc  *clients.Bloomsky
}

func NewWeather(l *logrus.Entry, bc *clients.Bloomsky, gbq *clients.Bigquery) *WeatherData {
	return &WeatherData{
		log: l,
		gbq: gbq,
		bc:  bc,
	}
}

func (h *WeatherData) GetAndStoreWeatherData(ctx context.Context) error {
	data, err := h.bc.GetData()
	if err != nil {
		h.log.WithError(err).Error("error getting bloomsky data")
		return err
	}

	h.log.Infof("got bloomsky data: %v", data)

	if err := h.gbq.InsertRows(ctx, &data); err != nil {
		h.log.WithError(err).Error("error storing data in bigquery")
		return err
	}

	return nil
}
