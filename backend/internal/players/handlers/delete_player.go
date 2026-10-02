package handlers

import (
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"Most/internal/players/repositories"
	"Most/internal/response"
)

type deletePlayerResponse struct {
	Message string `json:"message"`
}

// parsePlayerID turns the player_id from the url into a positive number.
func parsePlayerID(value string) (int, error) {
	playerID, err := strconv.Atoi(value)
	if err != nil || playerID <= 0 {
		return 0, errors.New("invalid playerID")
	}
	return playerID, nil
}

// DeletePlayerHandler handles DELETE /api/players/{playerID}
func DeletePlayerHandler(w http.ResponseWriter, r *http.Request) {
	playerID, err := parsePlayerID(r.PathValue("playerID"))
	if err != nil {
		response.BadRequest(w, "playerID must be a positive number")
		return
	}

	profileImage, err := repositories.DeletePlayer(playerID)
	if errors.Is(err, repositories.ErrPlayerNotFound) {
		response.JSON(w, http.StatusNotFound, response.ErrorBody{Error: "player not found"})
		return
	}
	if err != nil {
		response.InternalServerError(w, "can't delete the player")
		return
	}

	// the image is a file on disk, remove it too. If it is already gone, ignore it.
	if profileImage != "" {
		os.Remove(filepath.Join("uploads", "players", filepath.Base(profileImage)))
	}

	response.JSON(w, http.StatusOK, deletePlayerResponse{Message: "Player deleted successfully"})
}
