package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/handlers"
	"github.com/hendrik-the-ee/hydrobot/hydrobot/internal/datastorage"
	_ "github.com/mattn/go-sqlite3"
)

const DefaultDBName = "./hydrobot.db"

func main() {

	if shouldCreateDB(DefaultDBName) {
		os.Create(DefaultDBName)
	}

	sqlite, err := sql.Open("sqlite3", DefaultDBName)
	if err != nil {
		log.Fatalf("error opening db: %v", err)
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
		log.Fatalf("error creating table: %v", err)
	}

	ds := datastorage.New(sqlite)
	h := handlers.New(ds)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/data", h.CollectData).Methods("POST")
	router.HandleFunc("/ping", h.Ping).Methods("GET")

	log.Println("Listening on port :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func shouldCreateDB(name string) bool {
	_, err := os.Stat(name)
	return os.IsNotExist(err)
}
