package hydrolog

import (
	"fmt"
	"os"

	"github.com/sirupsen/logrus"
)

const (
	TimestampFormat = "02-01-2006 15:04:05"
)

func New(serviceName string) (*logrus.Entry, error) {
	logger := logrus.New()

	formatter := logrus.TextFormatter{}
	formatter.TimestampFormat = TimestampFormat
	formatter.FullTimestamp = true

	logger.Formatter = UTCFormatter{&formatter}

	filepath := fmt.Sprintf("%s.log", serviceName)

	f, err := os.OpenFile(filepath, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
	if err != nil {
		return nil, err
	}
	logger.Out = f

	entry := logger.WithFields(logrus.Fields{"service_name": serviceName})

	return entry, nil
}

type UTCFormatter struct {
	logrus.Formatter
}

func (u UTCFormatter) Format(e *logrus.Entry) ([]byte, error) {
	e.Time = e.Time.UTC()
	return u.Formatter.Format(e)
}
