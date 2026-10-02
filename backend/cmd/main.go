package main

import (
	"fmt"
	"log"
	"net/http"

	"Most/database"
	"Most/internal/routing"
)

func main() {
	if err := database.Init(); err != nil {
		fmt.Printf("Database initialization failed: %v\n", err)
		return
	}

	router := routing.NewRouter()

	log.Println("Server running on http://localhost:8080")

	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatalf("server error: %v", err)
	}
}