CREATE TABLE IF NOT EXISTS player (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATETIME NOT NULL,

    position TEXT,
    category TEXT,

    height_cm INTEGER,
    weight_kg DECIMAL(5,2),

    preferred_foot TEXT,

    previous_team TEXT
);