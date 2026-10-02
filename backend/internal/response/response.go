package response

import (
	"encoding/json"
	"log"
	"net/http"
)

type ErrorBody struct {
	Error string `json:"error"`
}

func JSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if body == nil {
		return
	}
	if err := json.NewEncoder(w).Encode(body); err != nil {
		log.Printf("response: can't encode body: %v", err)
	}
}

func BadRequest(w http.ResponseWriter, message string) {
	JSON(w, http.StatusBadRequest, ErrorBody{Error: message})
}

func InternalServerError(w http.ResponseWriter, message string) {
	JSON(w, http.StatusInternalServerError, ErrorBody{Error: message})
}
