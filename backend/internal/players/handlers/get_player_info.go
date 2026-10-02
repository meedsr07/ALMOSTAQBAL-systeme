package handlers

import (
	"net/http"

	"Most/internal/players/services"
	"Most/internal/response"
)

// GetPlayerInfoHandler handles GET /api/players/{playerID}.
func GetPlayerInfoHandler(w http.ResponseWriter, r *http.Request) {
	playerID, err := parsePlayerID(r.PathValue("playerID"))
	if err != nil {
		response.BadRequest(w, "playerID must be a positive number")
		return
	}

	player, err := services.GetPlayerByID(playerID)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, player)
}
