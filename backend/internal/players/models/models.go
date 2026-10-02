package models

import "time"

type Player struct {
    PlayerID      int       `json:"player_id"`
    FirstName     string    `json:"first_name"`
    LastName      string    `json:"last_name"`
    DateOfBirth   time.Time `json:"date_of_birth"`
    Position      string    `json:"position"`
    Category      string    `json:"category"`
    HeightCM      int       `json:"height_cm"`
    WeightKG      float64   `json:"weight_kg"`
    PreferredFoot string    `json:"preferred_foot"`
    PreviousTeam  string    `json:"previous_team"`
    ProfileImage  string    `json:"profile_image"`
}