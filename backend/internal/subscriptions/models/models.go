package models

import "time"

type Subscription struct {
	SubscriptionID int        `json:"id"`
	PlayerID       int        `json:"player_id"`
	Month          int        `json:"month"`
	Year           int        `json:"year"`
	Amount         float64    `json:"amount"`
	Status         string     `json:"status"`
	PaidAt         *time.Time `json:"paid_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

type Filter struct {
	PlayerID *int
	Month    *int
	Year     *int
	Status   *string
}

type Stats struct {
	TotalPlayers   int     `json:"total_players"`
	Paid           int     `json:"paid"`
	Unpaid         int     `json:"unpaid"`
	TotalCollected float64 `json:"total_collected"`
	TotalExpected  float64 `json:"total_expected"`
}
