CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('PAID', 'UNPAID')),
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE,
    UNIQUE (player_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_month_year ON subscriptions(month, year);
CREATE INDEX IF NOT EXISTS idx_subscriptions_player_id ON subscriptions(player_id);
