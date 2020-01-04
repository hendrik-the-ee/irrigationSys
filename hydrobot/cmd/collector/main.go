package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/handlers"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/hydrolog"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/models"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	hlog, err := hydrolog.New("collector")
	if err != nil {
		log.Fatalf("error creating hydrolog: %v", err)
	}

	if shouldCreateDB(models.DefaultDBName) {
		os.Create(models.DefaultDBName)
	}

	sqlite, err := sql.Open("sqlite3", models.DefaultDBName)
	if err != nil {
		hlog.Fatalf("error opening db: %v", err)
	}
	defer sqlite.Close()

	createTable := `CREATE TABLE
                        IF NOT EXISTS sensor_data (id INTEGER PRIMARY KEY AUTOINCREMENT,
                         sensor_id INTEGER,
                         sensor_type TEXT,
                         temp REAL,
                         moist REAL,
                         volts_in REAL,
                         created_at TEXT,
                         can_delete INTEGER)`
	statement, err := sqlite.Prepare(createTable)
	_, err = statement.Exec()
	if err != nil {
		hlog.Fatalf("error creating table: %v", err)
	}

	ds := datastorage.New(sqlite)
	h := handlers.New(ds, hlog)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.CollectData).Methods("POST")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	hlog.Info("Listening on port :8080")
	hlog.Fatal(http.ListenAndServe(":8080", router))
}

func shouldCreateDB(name string) bool {
	_, err := os.Stat(name)
	return os.IsNotExist(err)
}
