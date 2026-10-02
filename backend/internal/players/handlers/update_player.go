package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"Most/internal/players/models"
	"Most/internal/players/repositories"
	"Most/internal/players/services"
	"Most/internal/response"
)

// updatePlayerResponse is the body returned with HTTP 200.
type updatePlayerResponse struct {
	Message string        `json:"message"`
	Player  models.Player `json:"player"`
}

// UpdatePlayerHandler handles PUT /api/players/{playerID}.
// The body is JSON and every field is optional: only the fields sent are saved.
func UpdatePlayerHandler(w http.ResponseWriter, r *http.Request) {
	playerID, err := parsePlayerID(r.PathValue("playerID"))
	if err != nil {
		response.BadRequest(w, "playerID must be a positive number")
		return
	}

	var input services.UpdateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.BadRequest(w, "invalid JSON request body")
		return
	}

	player, err := services.UpdatePlayer(playerID, input)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, updatePlayerResponse{
		Message: "Player updated successfully",
		Player:  player,
	})
}

// writeServiceError turns a service error into the right HTTP status.
func writeServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		response.BadRequest(w, strings.TrimPrefix(err.Error(), "invalid player input: "))
	case errors.Is(err, repositories.ErrPlayerNotFound):
		response.JSON(w, http.StatusNotFound, response.ErrorBody{Error: err.Error()})
	default:
		response.InternalServerError(w, "player operation failed")
	}
}
