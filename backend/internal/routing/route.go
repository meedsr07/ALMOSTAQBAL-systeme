package routing

import (
	"net/http"

	"Most/internal/players/handlers"
	subscriptionHandlers "Most/internal/subscriptions/handlers"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/players", handlers.GetPlayersHandler)
	mux.HandleFunc("POST /api/players", handlers.Creat_player_Info)
	mux.HandleFunc("GET /api/players/{playerID}", handlers.GetPlayerInfoHandler)
	mux.HandleFunc("PUT /api/players/{playerID}", handlers.UpdatePlayerHandler)
	mux.HandleFunc("DELETE /api/players/{playerID}", handlers.DeletePlayerHandler)
	mux.HandleFunc("GET /api/players/{playerID}/subscriptions", subscriptionHandlers.GetPlayerSubscriptionsHandler)

	mux.HandleFunc("POST /api/subscriptions", subscriptionHandlers.CreateSubscriptionHandler)
	mux.HandleFunc("GET /api/subscriptions", subscriptionHandlers.GetSubscriptionsHandler)
	mux.HandleFunc("GET /api/subscriptions/stats", subscriptionHandlers.GetSubscriptionStatsHandler)
	mux.HandleFunc("GET /api/subscriptions/{subscriptionID}", subscriptionHandlers.GetSubscriptionHandler)
	mux.HandleFunc("PUT /api/subscriptions/{subscriptionID}", subscriptionHandlers.UpdateSubscriptionHandler)
	mux.HandleFunc("DELETE /api/subscriptions/{subscriptionID}", subscriptionHandlers.DeleteSubscriptionHandler)

	// serve the uploaded player images
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))
	return mux
}
