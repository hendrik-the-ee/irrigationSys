package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/hendrik-the-ee/irrigationSys/clients"
	"github.com/hendrik-the-ee/irrigationSys/handlers"
	"github.com/hendrik-the-ee/irrigationSys/hydrolog"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	BloomskyURL string
	BloomskyKey string
	ProjectID   string // TODO: add env config tags
	TableID     string
	DatasetID   string
	Interval    time.Duration
	//GoogleCreds string `envconfig:"GOOGLE_APPLICATION_CREDENTIALS" required:"true"`
}

func main() {
	hlog, err := hydrolog.New("weather-data")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	var config Config
	err = envconfig.Process("weather-data", &config)

	bc := clients.NewBloomsky(config.BloomskyURL, config.BloomskyKey)

	bq := clients.NewBigquery()

	h := handlers.NewWeather(hlog, bc, bq)

	run := func(ctx context.Context) {
		timer := time.NewTimer(0)
		for {
			select {
			case <-timer.C:
				err := h.StoreWeatherData()
				if err != nil {
					hlog.WithError(err).Error("unable to get and store weather data")
				}
				timer.Reset(config.Interval)
			case <-ctx.Done():
				return
			}
		}
	}

	ctx, cancel := context.WithCancel(context.Background())

	go run(ctx)

	s := make(chan os.Signal, 1)
	signal.Notify(s, syscall.SIGINT, syscall.SIGTERM)
	stop := <-s
	// log stopping due to signal
	cancel()
}
