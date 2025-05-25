package engine

import (
	"errors"
	"exchange/models"
	"sync"
	"time"
)

// TradeEngine handles order matching and market making
type TradeEngine struct {
	orderBooks   map[string]*models.OrderBook // Map of trading pair to order book
	marketMakers map[string]*MarketMakerBot   // Map of trading pair to market maker bot
	mu           sync.RWMutex
}

// NewTradeEngine creates a new trade engine instance
func NewTradeEngine() *TradeEngine {
	return &TradeEngine{
		orderBooks:   make(map[string]*models.OrderBook),
		marketMakers: make(map[string]*MarketMakerBot),
	}
}

// AddOrderBook adds a new order book for a trading pair
func (e *TradeEngine) AddOrderBook(pair string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if _, exists := e.orderBooks[pair]; !exists {
		e.orderBooks[pair] = models.NewOrderBook()
	}
}

// GetOrderBook returns the order book for a trading pair
func (e *TradeEngine) GetOrderBook(pair string) *models.OrderBook {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.orderBooks[pair]
}

// ProcessOrder processes a new order and attempts to match it
func (e *TradeEngine) ProcessOrder(order *models.Order) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	orderBook := e.orderBooks[order.Pair]
	if orderBook == nil {
		return ErrInvalidTradingPair
	}

	// Add order to order book
	orderBook.AddOrder(order)

	// Attempt to match orders
	orderBook.MatchOrders()

	return nil
}

// StartMarketMaker starts a market maker bot for a trading pair
func (e *TradeEngine) StartMarketMaker(pair string, config MarketMakerConfig) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	orderBook := e.orderBooks[pair]
	if orderBook == nil {
		return ErrInvalidTradingPair
	}

	// Create and start market maker bot
	bot := NewMarketMakerBot(orderBook, config)
	e.marketMakers[pair] = bot
	go bot.Start()

	return nil
}

// StopMarketMaker stops the market maker bot for a trading pair
func (e *TradeEngine) StopMarketMaker(pair string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if bot, exists := e.marketMakers[pair]; exists {
		bot.Stop()
		delete(e.marketMakers, pair)
	}
}

// MarketMakerConfig holds configuration for market maker bots
type MarketMakerConfig struct {
	Spread    float64       // Target spread between buy and sell orders
	Volume    float64       // Target volume per order
	Interval  time.Duration // Time between order updates
	MaxOrders int           // Maximum number of orders per side
}

// MarketMakerBot represents a bot that provides liquidity to the market
type MarketMakerBot struct {
	orderBook *models.OrderBook
	config    MarketMakerConfig
	stopChan  chan struct{}
}

// NewMarketMakerBot creates a new market maker bot
func NewMarketMakerBot(orderBook *models.OrderBook, config MarketMakerConfig) *MarketMakerBot {
	return &MarketMakerBot{
		orderBook: orderBook,
		config:    config,
		stopChan:  make(chan struct{}),
	}
}

// Start begins the market maker bot's operation
func (bot *MarketMakerBot) Start() {
	ticker := time.NewTicker(bot.config.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			bot.updateOrders()
		case <-bot.stopChan:
			return
		}
	}
}

// Stop stops the market maker bot
func (bot *MarketMakerBot) Stop() {
	close(bot.stopChan)
}

// updateOrders updates the bot's orders based on current market conditions
func (bot *MarketMakerBot) updateOrders() {
	// Get current market price
	midPrice := (bot.orderBook.GetBestBid() + bot.orderBook.GetBestAsk()) / 2
	if midPrice == 0 {
		// If no market price, use a default
		midPrice = 1000.0
	}

	// Calculate buy and sell prices
	buyPrice := midPrice * (1 - bot.config.Spread/2)
	sellPrice := midPrice * (1 + bot.config.Spread/2)

	// Create buy and sell orders
	for i := 0; i < bot.config.MaxOrders; i++ {
		// Create buy order
		buyOrder := &models.Order{
			Type:   models.OrderTypeBuy,
			Price:  buyPrice * (1 - float64(i)*0.001), // Slightly lower price for each level
			Amount: bot.config.Volume,
			Status: models.OrderStatusPending,
		}

		// Create sell order
		sellOrder := &models.Order{
			Type:   models.OrderTypeSell,
			Price:  sellPrice * (1 + float64(i)*0.001), // Slightly higher price for each level
			Amount: bot.config.Volume,
			Status: models.OrderStatusPending,
		}

		// Add orders to the order book
		bot.orderBook.AddOrder(buyOrder)
		bot.orderBook.AddOrder(sellOrder)
	}
}

// Errors
var (
	ErrInvalidTradingPair = errors.New("invalid trading pair")
)
