package handlers

import (
	"exchange/services"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)




var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}




// WebSocketHandler handles WebSocket connections for real-time market data
type WebSocketHandler struct {
	marketData *services.MarketDataService
	clients    map[string][]*websocket.Conn // Map of pair to client connections
	mu         sync.RWMutex
}







// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler(marketData *services.MarketDataService) *WebSocketHandler {
	return &WebSocketHandler{
		marketData: marketData,
		clients:    make(map[string][]*websocket.Conn),
	}
}






// HandleWebSocket handles incoming WebSocket connections
func (h *WebSocketHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Get trading pair from query parameter
	pair := r.URL.Query().Get("pair")
	if pair == "" {
		http.Error(w, "Missing trading pair", http.StatusBadRequest)
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading to WebSocket: %v", err)
		return
	}

	// Add client to the pair's client list
	h.mu.Lock()
	h.clients[pair] = append(h.clients[pair], conn)
	h.mu.Unlock()

	// Start goroutine to handle client connection
	go h.handleClient(pair, conn)
}






// handleClient handles a single WebSocket client connection
func (h *WebSocketHandler) handleClient(pair string, conn *websocket.Conn) {
	defer func() {
		conn.Close()
		h.removeClient(pair, conn)
	}()

	// Get tick channel for the pair
	tickChan := h.marketData.GetTickChannel(pair)
	if tickChan == nil {
		return
	}

	// Send initial market stats
	stats := h.marketData.GetMarketStats(pair)
	if stats != nil {
		if err := conn.WriteJSON(map[string]interface{}{
			"type": "stats",
			"data": stats,
		}); err != nil {
			log.Printf("Error sending initial stats: %v", err)
			return
		}
	}

	// Forward ticks to client
	for tick := range tickChan {
		if err := conn.WriteJSON(map[string]interface{}{
			"type": "tick",
			"data": tick,
		}); err != nil {
			log.Printf("Error sending tick: %v", err)
			return
		}
	}
}




// removeClient removes a client from the pair's client list
func (h *WebSocketHandler) removeClient(pair string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	clients := h.clients[pair]
	for i, client := range clients {
		if client == conn {
			// Remove client from slice
			h.clients[pair] = append(clients[:i], clients[i+1:]...)
			break
		}
	}

	// Remove pair if no clients left
	if len(h.clients[pair]) == 0 {
		delete(h.clients, pair)
	}
}




// BroadcastMessage broadcasts a message to all clients for a pair
func (h *WebSocketHandler) BroadcastMessage(pair string, message interface{}) {
	h.mu.RLock()
	clients := h.clients[pair]
	h.mu.RUnlock()

	for _, client := range clients {
		if err := client.WriteJSON(message); err != nil {
			log.Printf("Error broadcasting message: %v", err)
		}
	}
}
