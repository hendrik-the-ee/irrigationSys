package datastorage

import (
	"database/sql"
	"time"

	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
)

// Client represents the sqlite database client
type Client struct {
	db *sql.DB
}

func New(db *sql.DB) *Client {
	return &Client{
		db: db,
	}
}

// Save stores sensor data
func (c *Client) Save(sd *models.SensorData) error {
	sql := `INSERT INTO sensor_data
                (sensor_id, sensor_type, temp, moist, volts_in, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`
	statement, err := c.db.Prepare(sql)
	if err != nil {
		return err
	}

	createdAt := time.Now().UTC().Format(models.Layout)
	_, err = statement.Exec(sd.SensorID, sd.SensorType, sd.SoilTemp, sd.SoilMoisture, sd.VoltsIn, createdAt)
	return err
}

func (c *Client) GetAll() ([]*models.SensorData, error) {
	rows, err := c.db.Query(`SELECT id, sensor_id, sensor_type, temp, moist, volts_in, created_at
                                 FROM sensor_data WHERE can_delete is NULL`)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var data []*models.SensorData
	for rows.Next() {
		var createdAt string
		var sd models.SensorData
		rows.Scan(&sd.ID, &sd.SensorID, &sd.SensorType, &sd.SoilTemp, &sd.SoilMoisture, &sd.VoltsIn, &createdAt)
		t, err := time.Parse(models.Layout, createdAt)
		if err != nil {
			return nil, err
		}

		sd.CreatedAt = t
		data = append(data, &sd)
	}

	return data, nil
}

func (c *Client) MarkAsDeleted(ids []int32) error {
	sql := `UPDATE sensor_data SET can_delete=1 WHERE id=?`
	statement, err := c.db.Prepare(sql)
	if err != nil {
		return err
	}

	for _, id := range ids {
		_, err = statement.Exec(id)
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *Client) DeleteAll() error {
	sql := `DELETE FROM sensor_data WHERE can_delete=1`
	statement, err := c.db.Prepare(sql)
	if err != nil {
		return err
	}
	_, err = statement.Exec()
	return err
}
