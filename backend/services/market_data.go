// package services

// import (
// 	"math/rand"
// 	"sync"
// 	"time"

// 	"exchange/models"
// )

// // MarketDataService handles real-time market data generation
// type MarketDataService struct {
// 	orderBook *models.OrderBook
// 	tickChan  chan *models.Tick
// 	stopChan  chan struct{}
// 	mu        sync.RWMutex
// }

// // Tick represents a market data tick
// type Tick struct {
// 	Price     float64   `json:"price"`
// 	Volume    float64   `json:"volume"`
// 	Timestamp time.Time `json:"timestamp"`
// }

// // NewMarketDataService creates a new market data service
// func NewMarketDataService(orderBook *models.OrderBook) *MarketDataService {
// 	return &MarketDataService{
// 		orderBook: orderBook,
// 		tickChan:  make(chan *Tick, 100),
// 		stopChan:  make(chan struct{}),
// 	}
// }

// // Start begins generating market data
// func (s *MarketDataService) Start() {
// 	ticker := time.NewTicker(100 * time.Millisecond) // Generate ticks every 100ms
// 	defer ticker.Stop()

// 	for {
// 		select {
// 		case <-ticker.C:
// 			s.generateTick()
// 		case <-s.stopChan:
// 			return
// 		}
// 	}
// }

// // Stop stops generating market data
// func (s *MarketDataService) Stop() {
// 	close(s.stopChan)
// }

// // GetTickChannel returns the channel for receiving ticks
// func (s *MarketDataService) GetTickChannel() <-chan *Tick {
// 	return s.tickChan
// }

// // generateTick generates a new market data tick
// func (s *MarketDataService) generateTick() {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()

// 	// Get current market price
// 	midPrice := (s.orderBook.GetBestBid() + s.orderBook.GetBestAsk()) / 2
// 	if midPrice == 0 {
// 		midPrice = 1000.0 // Default price if no orders
// 	}

// 	// Add some random price movement
// 	priceChange := (rand.Float64() - 0.5) * 0.001 // ±0.05% random change
// 	newPrice := midPrice * (1 + priceChange)

// 	// Generate random volume
// 	volume := rand.Float64() * 10 // Random volume between 0 and 10

// 	// Create and send tick
// 	tick := &Tick{
// 		Price:     newPrice,
// 		Volume:    volume,
// 		Timestamp: time.Now(),
// 	}

// 	select {
// 	case s.tickChan <- tick:
// 	default:
// 		// Channel is full, drop the tick
// 	}
// }

// // GetMarketStats returns current market statistics
// func (s *MarketDataService) GetMarketStats() map[string]interface{} {
// 	s.mu.RLock()
// 	defer s.mu.RUnlock()

// 	return map[string]interface{}{
// 		"last_price": s.orderBook.LastPrice,
// 		"high_24h":   s.orderBook.High24h,
// 		"low_24h":    s.orderBook.Low24h,
// 		"volume_24h": s.orderBook.Volume24h,
// 		"best_bid":   s.orderBook.GetBestBid(),
// 		"best_ask":   s.orderBook.GetBestAsk(),
// 		"spread":     s.orderBook.GetSpread(),
// 		"timestamp":  time.Now(),
// 	}
// }
