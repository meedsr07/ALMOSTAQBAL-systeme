package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"Most/internal/subscriptions/models"
	"Most/internal/subscriptions/repositories"
)

var ErrInvalidInput = errors.New("invalid subscription input")

type CreateInput struct {
	PlayerID int     `json:"player_id"`
	Month    int     `json:"month"`
	Year     int     `json:"year"`
	Amount   float64 `json:"amount"`
	Status   string  `json:"status"`
}

type UpdateInput struct {
	Amount *float64 `json:"amount"`
	Status *string  `json:"status"`
}

func CreateSubscription(input CreateInput) (models.Subscription, error) {
	if err := validate(input.PlayerID, input.Month, input.Year, input.Amount, input.Status); err != nil {
		return models.Subscription{}, err
	}
	exists, err := repositories.PlayerExists(input.PlayerID)
	if err != nil {
		return models.Subscription{}, err
	}
	if !exists {
		return models.Subscription{}, repositories.ErrPlayerNotFound
	}

	subscription := models.Subscription{PlayerID: input.PlayerID, Month: input.Month, Year: input.Year, Amount: input.Amount, Status: strings.ToUpper(strings.TrimSpace(input.Status))}
	applyPaymentDate(&subscription)
	id, err := repositories.CreateSubscription(subscription)
	if err != nil {
		return models.Subscription{}, err
	}
	return repositories.GetSubscriptionByID(int(id))
}

func GetSubscriptions(filter models.Filter) ([]models.Subscription, error) {
	return repositories.GetSubscriptions(filter)
}
func GetSubscriptionByID(id int) (models.Subscription, error) {
	return repositories.GetSubscriptionByID(id)
}

func GetSubscriptionsByPlayer(playerID int) ([]models.Subscription, error) {
	exists, err := repositories.PlayerExists(playerID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, repositories.ErrPlayerNotFound
	}
	return repositories.GetSubscriptionsByPlayer(playerID)
}

func UpdateSubscription(id int, input UpdateInput) (models.Subscription, error) {
	if input.Amount == nil && input.Status == nil {
		return models.Subscription{}, fmt.Errorf("%w: amount or status is required", ErrInvalidInput)
	}
	subscription, err := repositories.GetSubscriptionByID(id)
	if err != nil {
		return models.Subscription{}, err
	}
	if input.Amount != nil {
		if *input.Amount < 0 {
			return models.Subscription{}, fmt.Errorf("%w: amount must be greater than or equal to 0", ErrInvalidInput)
		}
		subscription.Amount = *input.Amount
	}
	if input.Status != nil {
		if !validStatus(*input.Status) {
			return models.Subscription{}, fmt.Errorf("%w: status must be PAID or UNPAID", ErrInvalidInput)
		}
		subscription.Status = strings.ToUpper(strings.TrimSpace(*input.Status))
		applyPaymentDate(&subscription)
	}
	if err := repositories.UpdateSubscription(subscription); err != nil {
		return models.Subscription{}, err
	}
	return repositories.GetSubscriptionByID(id)
}

func DeleteSubscription(id int) error { return repositories.DeleteSubscription(id) }
func GetStats(month, year int) (models.Stats, error) {
	if err := validateMonthYear(month, year); err != nil {
		return models.Stats{}, err
	}
	return repositories.GetStats(month, year)
}

func validate(playerID, month, year int, amount float64, status string) error {
	if playerID <= 0 {
		return fmt.Errorf("%w: player_id must be a positive number", ErrInvalidInput)
	}
	if err := validateMonthYear(month, year); err != nil {
		return err
	}
	if amount < 0 {
		return fmt.Errorf("%w: amount must be greater than or equal to 0", ErrInvalidInput)
	}
	if !validStatus(status) {
		return fmt.Errorf("%w: status must be PAID or UNPAID", ErrInvalidInput)
	}
	return nil
}
func validateMonthYear(month, year int) error {
	if month < 1 || month > 12 {
		return fmt.Errorf("%w: month must be between 1 and 12", ErrInvalidInput)
	}
	if year < 2000 || year > 2100 {
		return fmt.Errorf("%w: year must be between 2000 and 2100", ErrInvalidInput)
	}
	return nil
}
func validStatus(status string) bool {
	status = strings.ToUpper(strings.TrimSpace(status))
	return status == "PAID" || status == "UNPAID"
}
func applyPaymentDate(subscription *models.Subscription) {
	if subscription.Status == "PAID" {
		now := time.Now().UTC()
		subscription.PaidAt = &now
	} else {
		subscription.PaidAt = nil
	}
}
