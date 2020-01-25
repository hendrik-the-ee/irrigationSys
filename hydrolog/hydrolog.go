package hydrolog

import (
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
