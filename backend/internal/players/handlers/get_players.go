package handlers

import (
	"net/http"

	"Most/internal/players/services"
	"Most/internal/response"
)

// GetPlayersHandler handles GET /api/players.
func GetPlayersHandler(w http.ResponseWriter, r *http.Request) {
	players, err := services.GetPlayers()
	if err != nil {
		response.InternalServerError(w, "can't get the players")
		return
	}

	response.JSON(w, http.StatusOK, players)
}
