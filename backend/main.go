package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

func main() {
	// Initialize router
	router := mux.NewRouter()

	// CORS middleware
	router.Use(corsMiddleware)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// User routes
	api.HandleFunc("/users", GetUsers).Methods("GET")
	api.HandleFunc("/users/{id}", GetUser).Methods("GET")
	api.HandleFunc("/users", CreateUser).Methods("POST")
	api.HandleFunc("/users/{id}", UpdateUser).Methods("PUT")
	api.HandleFunc("/users/{id}", DeleteUser).Methods("DELETE")

	// Trade routes
	api.HandleFunc("/trades", GetTrades).Methods("GET")
	api.HandleFunc("/trades", CreateTrade).Methods("POST")

	// Orderbook routes
	api.HandleFunc("/orderbook", GetOrderbook).Methods("GET")
	api.HandleFunc("/orderbook", UpdateOrderbook).Methods("POST")

	// WebSocket endpoint
	api.HandleFunc("/ws", handleWebSocket)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	fmt.Printf("Server starting on port %s...\n", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start server: %v\n", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// Handle WebSocket connection
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		// Echo the message back
		if err := conn.WriteMessage(messageType, message); err != nil {
			log.Printf("Error writing message: %v", err)
			break
		}
	}
}
