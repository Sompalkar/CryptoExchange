package routes

import (
	"exchange/websocket"
	"net/http"
)

// WebSocketRoutes handles WebSocket related routes
func WebSocketRoutes(pool *websocket.Pool) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(pool, w, r)
	})
}
