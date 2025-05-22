package websocket

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// Client represents a connected WebSocket client
type Client struct {
	ID   string
	Conn *websocket.Conn
	Pool *Pool
	mu   sync.Mutex
}

// Pool represents a group of connected clients
type Pool struct {
	Register   chan *Client
	Unregister chan *Client
	Clients    map[*Client]bool
	Broadcast  chan []byte
	mu         sync.Mutex
}

// NewPool creates a new WebSocket pool
func NewPool() *Pool {
	return &Pool{
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan []byte),
	}
}

// Start starts the WebSocket pool
func (pool *Pool) Start() {
	for {
		select {
		case client := <-pool.Register:
			pool.mu.Lock()
			pool.Clients[client] = true
			pool.mu.Unlock()
			log.Printf("Client %s connected. Size of connection pool: %d", client.ID, len(pool.Clients))

		case client := <-pool.Unregister:
			pool.mu.Lock()
			delete(pool.Clients, client)
			pool.mu.Unlock()
			log.Printf("Client %s disconnected. Size of connection pool: %d", client.ID, len(pool.Clients))

		case message := <-pool.Broadcast:
			pool.mu.Lock()
			for client := range pool.Clients {
				if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
					log.Printf("Error broadcasting message to client %s: %v", client.ID, err)
					client.Conn.Close()
					delete(pool.Clients, client)
				}
			}
			pool.mu.Unlock()
		}
	}
}
