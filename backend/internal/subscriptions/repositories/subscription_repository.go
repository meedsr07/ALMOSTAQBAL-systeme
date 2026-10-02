package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"Most/database"
	"Most/internal/subscriptions/models"
)

var (
	ErrSubscriptionNotFound  = errors.New("subscription not found")
	ErrDuplicateSubscription = errors.New("subscription already exists for this player, month and year")
	ErrPlayerNotFound        = errors.New("player not found")
)

const subscriptionColumns = `id, player_id, month, year, amount, status, paid_at, created_at`

func CreateSubscription(subscription models.Subscription) (int64, error) {
	result, err := database.Database.Exec(
		`INSERT INTO subscriptions (player_id, month, year, amount, status, paid_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		subscription.PlayerID, subscription.Month, subscription.Year, subscription.Amount,
		subscription.Status, subscription.PaidAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return 0, ErrDuplicateSubscription
		}
		return 0, fmt.Errorf("can't insert subscription: %w", err)
	}
	return result.LastInsertId()
}

func GetSubscriptionByID(subscriptionID int) (models.Subscription, error) {
	row := database.Database.QueryRow(`SELECT `+subscriptionColumns+` FROM subscriptions WHERE id = ?`, subscriptionID)
	return scanSubscription(row)
}

func GetSubscriptions(filter models.Filter) ([]models.Subscription, error) {
	query := `SELECT ` + subscriptionColumns + ` FROM subscriptions WHERE 1 = 1`
	args := []any{}
	if filter.PlayerID != nil {
		query += ` AND player_id = ?`
		args = append(args, *filter.PlayerID)
	}
	if filter.Month != nil {
		query += ` AND month = ?`
		args = append(args, *filter.Month)
	}
	if filter.Year != nil {
		query += ` AND year = ?`
		args = append(args, *filter.Year)
	}
	if filter.Status != nil {
		query += ` AND status = ?`
		args = append(args, *filter.Status)
	}
	query += ` ORDER BY year DESC, month DESC, id DESC`

	rows, err := database.Database.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("can't read subscriptions: %w", err)
	}
	defer rows.Close()
	return scanSubscriptions(rows)
}

func GetSubscriptionsByPlayer(playerID int) ([]models.Subscription, error) {
	return GetSubscriptions(models.Filter{PlayerID: &playerID})
}

func GetSubscriptionsByMonth(month, year int) ([]models.Subscription, error) {
	return GetSubscriptions(models.Filter{Month: &month, Year: &year})
}

func UpdateSubscription(subscription models.Subscription) error {
	result, err := database.Database.Exec(
		`UPDATE subscriptions SET amount = ?, status = ?, paid_at = ? WHERE id = ?`,
		subscription.Amount, subscription.Status, subscription.PaidAt, subscription.SubscriptionID,
	)
	if err != nil {
		return fmt.Errorf("can't update subscription: %w", err)
	}
	changed, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("can't check updated subscription: %w", err)
	}
	if changed == 0 {
		return ErrSubscriptionNotFound
	}
	return nil
}

func DeleteSubscription(subscriptionID int) error {
	result, err := database.Database.Exec(`DELETE FROM subscriptions WHERE id = ?`, subscriptionID)
	if err != nil {
		return fmt.Errorf("can't delete subscription: %w", err)
	}
	changed, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("can't check deleted subscription: %w", err)
	}
	if changed == 0 {
		return ErrSubscriptionNotFound
	}
	return nil
}

func PlayerExists(playerID int) (bool, error) {
	var exists bool
	err := database.Database.QueryRow(`SELECT EXISTS(SELECT 1 FROM player WHERE player_id = ?)`, playerID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("can't check player: %w", err)
	}
	return exists, nil
}

func GetStats(month, year int) (models.Stats, error) {
	var stats models.Stats
	err := database.Database.QueryRow(`
		SELECT
			(SELECT COUNT(*) FROM player),
			COALESCE(SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'UNPAID' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0),
			COALESCE(SUM(amount), 0)
		FROM subscriptions
		WHERE month = ? AND year = ?`, month, year,
	).Scan(&stats.TotalPlayers, &stats.Paid, &stats.Unpaid, &stats.TotalCollected, &stats.TotalExpected)
	if err != nil {
		return models.Stats{}, fmt.Errorf("can't calculate subscription statistics: %w", err)
	}
	return stats, nil
}

type scanner interface{ Scan(...any) error }

func scanSubscription(row scanner) (models.Subscription, error) {
	var subscription models.Subscription
	var paidAt sql.NullTime
	if err := row.Scan(&subscription.SubscriptionID, &subscription.PlayerID, &subscription.Month, &subscription.Year,
		&subscription.Amount, &subscription.Status, &paidAt, &subscription.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.Subscription{}, ErrSubscriptionNotFound
		}
		return models.Subscription{}, fmt.Errorf("can't read subscription: %w", err)
	}
	if paidAt.Valid {
		value := paidAt.Time
		subscription.PaidAt = &value
	}
	return subscription, nil
}

func scanSubscriptions(rows *sql.Rows) ([]models.Subscription, error) {
	subscriptions := []models.Subscription{}
	for rows.Next() {
		subscription, err := scanSubscription(rows)
		if err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, subscription)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("can't read subscriptions: %w", err)
	}
	return subscriptions, nil
}
