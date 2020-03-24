package clients

import (
	"context"
	"fmt"
	"io"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"github.com/hendrik-the-ee/irrigationSys/models"
)

type Storage interface {
	UploadToStorage(string, context.Context) error
}

type CloudStorage struct {
	bucketName string
	client     *storage.Client
}

func NewCloudStorage(bucketName string, client *storage.Client) *CloudStorage {
	return &CloudStorage{
		bucketName: bucketName,
		client:     client,
	}
}

func (gcp *CloudStorage) UploadToStorage(filename string, ctx context.Context) error {
	f, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	bh := gcp.client.Bucket(gcp.bucketName)
	if _, err := bh.Attrs(ctx); err != nil {
		return err
	}

	now := time.Now().Format(models.Layout)
	gcpFilename := fmt.Sprintf("%s.csv", now)

	obj := bh.Object(gcpFilename)
	w := obj.NewWriter(ctx)

	if _, err := io.Copy(w, f); err != nil {
		return err
	}
	if err := w.Close(); err != nil {
		return err
	}

	return nil
}
