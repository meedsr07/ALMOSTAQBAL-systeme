package routing

import (
	"net/http"

	"Most/internal/players/handlers"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/players", handlers.Creat_player_Info)
	return mux
}
