package database

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	_ "github.com/mattn/go-sqlite3"
)

var Database *sql.DB

func Init() error {
	_, thisFile, _, _ := runtime.Caller(0)
	baseDirName := filepath.Dir(thisFile)
	// Datebase file
	dbFile := "./MOSTAQBAL.db"

	var err error
	Database, err = sql.Open("sqlite3", dbFile+"?_foreign_keys=on")
	if err != nil {
		return fmt.Errorf("can't open/create MOSTAQBAL database: %v", err)
	}
	if err := Database.Ping(); err != nil {
		return fmt.Errorf("can't connect to database: %v", err)
	}
	driver, err := sqlite3.WithInstance(Database, &sqlite3.Config{})
	if err != nil {
		return fmt.Errorf("can't create migration driver: %v", err)
	}
	migrationsPath := "file://" + filepath.Join(baseDirName, "migrations", "sqlite3")
	m, err := migrate.NewWithDatabaseInstance(migrationsPath, "sqlite3", driver)
	if err != nil {
		return fmt.Errorf("can't create migrate instance: %v", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migration failed: %v", err)
	}

	return nil

}
