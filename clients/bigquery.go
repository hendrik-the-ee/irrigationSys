package clients

import (
	"context"
	"fmt"

	"cloud.google.com/go/bigquery"
)

type Bigquery struct {
	ProjectID string
	DatasetID string
	TableID   string
}

func NewBigquery(pid, did, tid string) *Bigquery {
	return &Bigquery{
		ProjectID: pid,
		DatasetID: did,
		TableID:   tid,
	}
}

func (b *Bigquery) InsertRows(ctx context.Context, rows []bigquery.ValueSaver) error {
	client, err := bigquery.NewClient(ctx, b.ProjectID)
	if err != nil {
		return fmt.Errorf("bigquery.NewClient: %v", err)
	}

	defer client.Close()

	inserter := client.Dataset(b.DatasetID).Table(b.TableID).Inserter()
	if err := inserter.Put(ctx, rows); err != nil {
		return err
	}
	return nil
}
