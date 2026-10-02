package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"Most/internal/response"
	"Most/internal/subscriptions/models"
	"Most/internal/subscriptions/repositories"
	"Most/internal/subscriptions/services"
)

type messageResponse struct {
	Message string `json:"message"`
}

// CreateSubscriptionHandler handles POST /api/subscriptions.
func CreateSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	var input services.CreateInput
	if !decodeJSON(w, r, &input) {
		return
	}
	subscription, err := services.CreateSubscription(input)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, subscription)
}

// GetSubscriptionsHandler handles GET /api/subscriptions with optional filters.
func GetSubscriptionsHandler(w http.ResponseWriter, r *http.Request) {
	filter, err := parseFilter(r)
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}
	subscriptions, err := services.GetSubscriptions(filter)
	if err != nil {
		response.InternalServerError(w, "can't get subscriptions")
		return
	}
	response.JSON(w, http.StatusOK, subscriptions)
}

// GetSubscriptionHandler handles GET /api/subscriptions/{subscriptionID}.
func GetSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePositivePathID(w, r, "subscriptionID")
	if !ok {
		return
	}
	subscription, err := services.GetSubscriptionByID(id)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, subscription)
}

// UpdateSubscriptionHandler handles PUT /api/subscriptions/{subscriptionID}.
func UpdateSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePositivePathID(w, r, "subscriptionID")
	if !ok {
		return
	}
	var input services.UpdateInput
	if !decodeJSON(w, r, &input) {
		return
	}
	subscription, err := services.UpdateSubscription(id, input)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, subscription)
}

// DeleteSubscriptionHandler handles DELETE /api/subscriptions/{subscriptionID}.
func DeleteSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePositivePathID(w, r, "subscriptionID")
	if !ok {
		return
	}
	if err := services.DeleteSubscription(id); err != nil {
		writeServiceError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, messageResponse{Message: "Subscription deleted successfully"})
}

// GetPlayerSubscriptionsHandler handles GET /api/players/{playerID}/subscriptions.
func GetPlayerSubscriptionsHandler(w http.ResponseWriter, r *http.Request) {
	playerID, ok := parsePositivePathID(w, r, "playerID")
	if !ok {
		return
	}
	subscriptions, err := services.GetSubscriptionsByPlayer(playerID)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, subscriptions)
}

// GetSubscriptionStatsHandler handles GET /api/subscriptions/stats?month=10&year=2026.
func GetSubscriptionStatsHandler(w http.ResponseWriter, r *http.Request) {
	month, err := requiredQueryInt(r, "month")
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}
	year, err := requiredQueryInt(r, "year")
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}
	stats, err := services.GetStats(month, year)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, stats)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		response.BadRequest(w, "invalid JSON request body")
		return false
	}
	return true
}

func parseFilter(r *http.Request) (models.Filter, error) {
	var filter models.Filter
	var err error
	if filter.PlayerID, err = optionalQueryInt(r, "player_id"); err != nil {
		return filter, err
	}
	if filter.Month, err = optionalQueryInt(r, "month"); err != nil {
		return filter, err
	}
	if filter.Year, err = optionalQueryInt(r, "year"); err != nil {
		return filter, err
	}
	if filter.PlayerID != nil && *filter.PlayerID <= 0 {
		return filter, errors.New("player_id must be a positive number")
	}
	if filter.Month != nil && (*filter.Month < 1 || *filter.Month > 12) {
		return filter, errors.New("month must be between 1 and 12")
	}
	if filter.Year != nil && (*filter.Year < 2000 || *filter.Year > 2100) {
		return filter, errors.New("year must be between 2000 and 2100")
	}
	if rawStatus := r.URL.Query().Get("status"); rawStatus != "" {
		status := strings.ToUpper(strings.TrimSpace(rawStatus))
		if status != "PAID" && status != "UNPAID" {
			return filter, errors.New("status must be PAID or UNPAID")
		}
		filter.Status = &status
	}
	return filter, nil
}

func optionalQueryInt(r *http.Request, name string) (*int, error) {
	raw := r.URL.Query().Get(name)
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return nil, errors.New(name + " must be a number")
	}
	return &value, nil
}
func requiredQueryInt(r *http.Request, name string) (int, error) {
	value, err := optionalQueryInt(r, name)
	if err != nil {
		return 0, err
	}
	if value == nil {
		return 0, errors.New(name + " is required")
	}
	return *value, nil
}
func parsePositivePathID(w http.ResponseWriter, r *http.Request, name string) (int, bool) {
	id, err := strconv.Atoi(r.PathValue(name))
	if err != nil || id <= 0 {
		response.BadRequest(w, name+" must be a positive number")
		return 0, false
	}
	return id, true
}
func writeServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		response.BadRequest(w, strings.TrimPrefix(err.Error(), "invalid subscription input: "))
	case errors.Is(err, repositories.ErrPlayerNotFound), errors.Is(err, repositories.ErrSubscriptionNotFound):
		response.JSON(w, http.StatusNotFound, response.ErrorBody{Error: err.Error()})
	case errors.Is(err, repositories.ErrDuplicateSubscription):
		response.JSON(w, http.StatusConflict, response.ErrorBody{Error: err.Error()})
	default:
		response.InternalServerError(w, "subscription operation failed")
	}
}
