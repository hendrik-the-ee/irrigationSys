package clients

import (
	"context"
	"fmt"
	"io"
	"os"

	"cloud.google.com/go/storage"
)

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
	// Check if the bucket exists
	if attrs, err := bh.Attrs(ctx); err != nil {
		fmt.Printf("BUCKET %s ATTRS: %v, ERROR: %v", gcp.bucketName, attrs, err)
		return err
	}

	obj := bh.Object(filename)
	w := obj.NewWriter(ctx)

	if _, err := io.Copy(w, f); err != nil {
		return err
	}
	if err := w.Close(); err != nil {
		return err
	}

	return nil
}
