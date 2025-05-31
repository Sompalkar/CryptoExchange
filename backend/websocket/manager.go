package websocket

import (
	"exchange/models"
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

// Pool manages WebSocket connections
type Pool struct {
	Register   chan *Client
	Unregister chan *Client
	Clients    map[*Client]bool
	Broadcast  chan []byte
	OrderBook  *models.OrderBook
	mu         sync.RWMutex
}

// NewPool creates a new WebSocket pool
func NewPool() *Pool {
	return &Pool{
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan []byte),
		OrderBook:  models.NewOrderBook(),
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
			log.Printf("Client connected. Size of connection pool: %d", len(pool.Clients))
		case client := <-pool.Unregister:
			pool.mu.Lock()
			delete(pool.Clients, client)
			pool.mu.Unlock()
			log.Printf("Client disconnected. Size of connection pool: %d", len(pool.Clients))
		case message := <-pool.Broadcast:
			pool.mu.RLock()
			for client := range pool.Clients {
				if err := client.Conn.WriteMessage(1, message); err != nil {
					log.Printf("Error broadcasting message: %v", err)
				}
			}
			pool.mu.RUnlock()
		}
	}
}

// GetOrderBook returns the current order book
func (pool *Pool) GetOrderBook() *models.OrderBook {
	pool.mu.RLock()
	defer pool.mu.RUnlock()
	return pool.OrderBook
}

// UpdateOrderBook updates the order book and broadcasts changes
func (pool *Pool) UpdateOrderBook(order *models.Order) {
	pool.mu.Lock()
	pool.OrderBook.AddOrder(order)
	pool.mu.Unlock()

	// Broadcast order book update
	pool.Broadcast <- []byte("orderbook_update")
}
