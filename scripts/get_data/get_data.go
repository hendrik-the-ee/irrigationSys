package main

import (
	"context"
	"encoding/csv"
	"flag"
	"fmt"
	"os"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/hendrik-the-ee/irrigationSys/clients"
	"google.golang.org/api/iterator"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ProjectID string `envconfig:"PROJECT_ID" required:"true"`
	TableID   string `envconfig:"TABLE_ID" required:"true"`
	DatasetID string `envconfig:"DATASET_ID" required:"true"`
}

func main() {
	var config Config
	envconfig.Process("get data", &config)

	var start string
	flag.StringVar(&start, "start", "", "start date YYYY-MM-DD")

	var end string
	flag.StringVar(&end, "end", "", "end date YYYY-MM-DD")

	flag.Parse()

	table := fmt.Sprintf("%s.%s.%s", config.ProjectID, config.DatasetID, config.TableID)
	query := fmt.Sprintf(`SELECT * FROM %s`, table)
	if start != "" {
		query = query + fmt.Sprintf(` WHERE CreatedAt >= Timestamp("%s")`, start)
	}
	if start != "" && end != "" {
		query = query + ` AND`
	}
	if end != "" {
		query = query + fmt.Sprintf(` CreatedAt <= Timestamp("%s")`, end)
	}

	fmt.Printf("\nRunning query: %s\n", query)

	ctx := context.Background()
	bq := clients.NewBigquery(config.ProjectID, config.DatasetID, config.TableID)

	it, err := bq.QueryTable(ctx, query)
	if err != nil {
		panic(fmt.Sprintf("error getting bq data: %+v", err))
	}

	if it.TotalRows == 0 {
		fmt.Println("No data found. Goodbye.")
		return
	}

	csvFile, err := os.Create(fmt.Sprintf("irrigation_system_report-%v.csv", time.Now().Format("2006-01-02-15:04:05")))
	if err != nil {
		panic(fmt.Sprintf("creating csv file: %+v", err))
	}
	defer csvFile.Close()

	w := csv.NewWriter(csvFile)
	headers := []string{"SensorID", "SensorType", "SoilTemp", "SoilMoisture", "VoltsIn", "CreatedAt"}
	if err := w.Write(headers); err != nil {
		panic("error writing headers")
	}

	for {
		var row []bigquery.Value
		err := it.Next(&row)
		if err == iterator.Done {
			break
		}
		if err != nil {
			panic(fmt.Sprintf("error reading bq row: %+v", err))
		}
		records := make([]string, len(row))
		for j, r := range row {
			records[j] = fmt.Sprintf("%v", r)
		}
		if err := w.Write(records); err != nil {
			panic(fmt.Sprintf("Error writing row: %v", err))
		}
	}
	w.Flush()
}
