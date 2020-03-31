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
	"github.com/sirupsen/logrus"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	BloomskyURL string `envconfig:"BLOOMSKY_URL" required:"true"`
	BloomskyKey string `envconfig:"BLOOMSKY_KEY" required:"true"`
	ProjectID   string `envconfig:"PROJECT_ID" required:"true"`
	TableID     string `envconfig:"TABLE_ID" required:"true"`
	DatasetID   string `envconfig:"DATASET_ID" required:"true"`
	IntervalNum int    `envconfig:"INTERVAL_NUM" required:"true"`
	Interval    time.Duration
}

func main() {
	hlog, err := hydrolog.New("weather-data")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	var config Config
	err = envconfig.Process("weather-data", &config)
	if err != nil {
		hlog.Fatalf("error processing config: %v", err)
	}

	config.Interval = time.Duration(config.IntervalNum)

	bc := clients.NewBloomsky(config.BloomskyURL, config.BloomskyKey)

	bq := clients.NewBigquery(config.ProjectID, config.DatasetID, config.TableID)

	h := handlers.NewWeather(hlog, bc, bq)

	ctx, cancel := context.WithCancel(context.Background())

	hlog.Info("starting weather handler")

	stop := schedule(ctx, h.GetAndStoreWeatherData, config.Interval*time.Minute, hlog)

	s := make(chan os.Signal, 1)
	signal.Notify(s, syscall.SIGINT, syscall.SIGTERM)
	select {
	case <-s:
		hlog.Info("stopping due to signal")
		stop <- true
		cancel()
	}
}

func schedule(ctx context.Context, f func(context.Context) error, delay time.Duration, log *logrus.Entry) chan bool {
	timer := time.NewTimer(0)
	stop := make(chan bool)

	go func() {
		for {
			select {
			case <-timer.C:
				err := f(ctx)
				if err != nil {
					log.WithError(err).Error("error getting and storing weather data")
				}
				log.Info("success")
				timer.Reset(delay)
			case <-ctx.Done():
			case <-stop:
				return
			}
		}
	}()

	return stop
}
