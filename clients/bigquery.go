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

func (b *Bigquery) InsertRows(ctx context.Context, row bigquery.ValueSaver) error {
	client, err := bigquery.NewClient(ctx, b.ProjectID)
	if err != nil {
		return fmt.Errorf("bigquery.InsertRows.NewClient: %v", err)
	}

	defer client.Close()

	inserter := client.Dataset(b.DatasetID).Table(b.TableID).Inserter()
	if err := inserter.Put(ctx, row); err != nil {
		return fmt.Errorf("bigquery.InsertRows.Put: %v", err)
	}
	return nil
}

func (b *Bigquery) QueryTable(ctx context.Context, statement string) (*bigquery.RowIterator, error) {
	client, err := bigquery.NewClient(ctx, b.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("bigquery.QueryTable.NewClient: %v", err)
	}

	defer client.Close()

	q := client.Query(statement)

	rowIterator, err := q.Read(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery.QueryTable.Read: %v", err)
	}

	return rowIterator, nil
}
