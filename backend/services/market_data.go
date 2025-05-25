package services

import (
	"exchange/models"
	"sync"
	"time"
)

// MarketDataService handles real-time market data generation and distribution
type MarketDataService struct {
	orderBooks map[string]*models.OrderBook
	tickChans  map[string]chan *Tick
	stopChan   chan struct{}
	mu         sync.RWMutex
}

// Tick represents a market data tick
type Tick struct {
	Pair      string    `json:"pair"`
	Price     float64   `json:"price"`
	Volume    float64   `json:"volume"`
	Timestamp time.Time `json:"timestamp"`
}

// NewMarketDataService creates a new market data service
func NewMarketDataService() *MarketDataService {
	return &MarketDataService{
		orderBooks: make(map[string]*models.OrderBook),
		tickChans:  make(map[string]chan *Tick),
		stopChan:   make(chan struct{}),
	}
}

// AddOrderBook adds an order book to track
func (s *MarketDataService) AddOrderBook(pair string, orderBook *models.OrderBook) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.orderBooks[pair] = orderBook
	s.tickChans[pair] = make(chan *Tick, 100)
}

// RemoveOrderBook removes an order book from tracking
func (s *MarketDataService) RemoveOrderBook(pair string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.orderBooks, pair)
	if ch, exists := s.tickChans[pair]; exists {
		close(ch)
		delete(s.tickChans, pair)
	}
}

// Start begins generating market data
func (s *MarketDataService) Start() {
	ticker := time.NewTicker(100 * time.Millisecond) // Generate ticks every 100ms
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.generateTicks()
		case <-s.stopChan:
			return
		}
	}
}

// Stop stops generating market data
func (s *MarketDataService) Stop() {
	close(s.stopChan)
}

// GetTickChannel returns the channel for receiving ticks for a pair
func (s *MarketDataService) GetTickChannel(pair string) <-chan *Tick {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if ch, exists := s.tickChans[pair]; exists {
		return ch
	}
	return nil
}

// generateTicks generates market data ticks for all tracked pairs
func (s *MarketDataService) generateTicks() {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for pair, orderBook := range s.orderBooks {
		// Get current market price
		midPrice := (orderBook.GetBestBid() + orderBook.GetBestAsk()) / 2
		if midPrice == 0 {
			continue // Skip if no market price
		}

		// Create tick
		tick := &Tick{
			Pair:      pair,
			Price:     midPrice,
			Volume:    orderBook.Volume24h,
			Timestamp: time.Now(),
		}

		// Send tick to channel
		select {
		case s.tickChans[pair] <- tick:
		default:
			// Channel is full, drop the tick
		}
	}
}

// GetMarketStats returns current market statistics for a pair
func (s *MarketDataService) GetMarketStats(pair string) map[string]interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	orderBook := s.orderBooks[pair]
	if orderBook == nil {
		return nil
	}

	return map[string]interface{}{
		"pair":       pair,
		"last_price": orderBook.LastPrice,
		"high_24h":   orderBook.High24h,
		"low_24h":    orderBook.Low24h,
		"volume_24h": orderBook.Volume24h,
		"best_bid":   orderBook.GetBestBid(),
		"best_ask":   orderBook.GetBestAsk(),
		"spread":     orderBook.GetSpread(),
		"timestamp":  time.Now(),
	}
}
