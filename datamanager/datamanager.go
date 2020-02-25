package datamanager

import (
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"sync"
	"time"

	"github.com/hendrik-the-ee/irrigationSys/models"
)

var mode = os.FileMode(0700)

type Client struct {
	filepath string
	mu       *sync.Mutex
}

func New(filepath string) *Client {
	return &Client{
		filepath: filepath,
		mu:       &sync.Mutex{},
	}
}

func (c *Client) AppendToFile(sd *models.SensorData) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	var rows [][]string

	if _, err := os.Stat(c.filepath); os.IsNotExist(err) {
		_, err := os.Create(c.filepath)
		if err != nil {
			return err
		}
		rows = append(rows, models.GetColumnHeaders())
	}

	rows = append(rows, sd.ToCSVRecord())

	f, err := os.OpenFile(c.filepath, os.O_WRONLY|os.O_APPEND, mode)
	if err != nil {
		return err
	}
	defer f.Close()

	w := csv.NewWriter(f)
	defer w.Flush()

	for _, row := range rows {
		err := w.Write(row)
		if err != nil {
			return err
		}
	}

	return nil
}

func (c *Client) ArchiveFile(filepath string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	// rename file to archive
	now := time.Now().UTC()
	year, month, day := now.Date()

	archiveFileName := fmt.Sprintf("archive.%v_%v_%v_%v.csv", year, month, day, now.Hour())
	return moveFile(filepath, archiveFileName)
}

func moveFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	if err != nil {
		return err
	}

	return os.Remove(src)
}
