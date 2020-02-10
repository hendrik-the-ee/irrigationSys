package datamanager

import (
	"io"
	"os"
	"strings"
	"sync"

	"github.com/hendrik-the-ee/irrigationSys/models"
)

var (
	mode = os.FileMode(0700)
)

// Client represents the sqlite database client
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

func (c *Client) AppendToFile(sd *models.SensorData) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	var createdFile bool

	if _, err := os.Stat(c.filepath); os.IsNotExist(err) {
		os.MkdirAll(c.filepath, mode)
		createdFile = true
	}

	f, err := os.OpenFile(c.filepath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return "", err
	}
	defer f.Close()

	if createdFile {
		headers := strings.Join(models.GetColumnHeaders(), ",")
		if _, err := f.WriteString(headers); err != nil {
			return f.Name(), err
		}
	}

	record := strings.Join(sd.ToCSVRecord(), ",")
	if _, err := f.WriteString(record); err != nil {
		return f.Name(), err
	}

	return f.Name(), err
}

func (c *Client) CreateCopy(newFilepath string, deleteOld bool) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if err := copyFile(c.filepath, newFilepath); err != nil {
		return err
	}

	if deleteOld {
		if err := os.Remove(c.filepath); err != nil {
			return err
		}
	}

	return nil
}

func copyFile(src, dst string) error {
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
	return out.Close()
}
