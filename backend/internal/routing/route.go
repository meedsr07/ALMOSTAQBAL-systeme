package routing

import (
	"net/http"

	"Most/internal/players/handlers"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/players", handlers.GetPlayersHandler)
	mux.HandleFunc("POST /api/players", handlers.Creat_player_Info)
	mux.HandleFunc("DELETE /api/players/{playerID}", handlers.DeletePlayerHandler)

	// serve the uploaded player images
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))
	return mux
}
