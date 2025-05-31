package engine

import (
	"encoding/json"
	"errors"
	"exchange/handlers"
	"exchange/models"
	"exchange/websocket"
	"log"
	"math/rand"
	"sync"
	"time"
)

// Error definitions
var (
	ErrInvalidTradingPair = errors.New("invalid trading pair")
)

// TradeEngine handles order matching and market making
type TradeEngine struct {
	orderBooks   map[string]*models.OrderBook // Map of trading pair to order book
	marketMakers map[string]*MarketMakerBot   // Map of trading pair to market maker bot
	wsHandler    *handlers.WebSocketHandler   // WebSocket handler for real-time updates
	mu           sync.RWMutex
	wsHub        *websocket.Pool
}

// NewTradeEngine creates a new trade engine instance
func NewTradeEngine(wsHandler *handlers.WebSocketHandler, wsHub *websocket.Pool) *TradeEngine {
	return &TradeEngine{
		orderBooks:   make(map[string]*models.OrderBook),
		marketMakers: make(map[string]*MarketMakerBot),
		wsHandler:    wsHandler,
		wsHub:        wsHub,
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

// @Summary Process a new order
// @Description Processes a new order and attempts to match it with existing orders
// @Tags trading
// @Accept json
// @Produce json
// @Param order body models.Order true "Order to process"
// @Success 200 {object} TradeResult
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/trade/process [post]
func (e *TradeEngine) ProcessOrder(order *models.Order) (*TradeResult, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	orderBook := e.orderBooks[order.Pair]
	if orderBook == nil {
		return nil, ErrInvalidTradingPair
	}

	// Add order to order book
	orderBook.AddOrder(order)

	// Attempt to match orders
	orderBook.MatchOrders()

	// Broadcast order book updates
	e.broadcastOrderBookUpdate(order.Pair)

	// Handle matches
	for _, match := range orderBook.GetMatches() {
		// Broadcast trade
		e.broadcastTrade(match)

		// If one of the orders is from a bot, handle it
		if match.BuyOrder.IsBot || match.SellOrder.IsBot {
			e.handleBotMatch(match)
		}
	}

	// If this is a bot order and it was filled, create a new bot order
	if order.IsBot && order.Status == models.OrderStatusFilled {
		go e.createNewBotOrder(order.Pair)
	}

	return &TradeResult{
		Order:  order,
		Trades: orderBook.GetMatches(),
	}, nil
}

// handleBotMatch handles a match involving a bot order
func (e *TradeEngine) handleBotMatch(match *models.Trade) {
	// If the bot's order was filled, create a new order to maintain liquidity
	if match.BuyOrder.IsBot {
		e.createBotReplacementOrder(match.BuyOrder)
	}
	if match.SellOrder.IsBot {
		e.createBotReplacementOrder(match.SellOrder)
	}
}

// createBotReplacementOrder creates a new bot order to replace a filled one
func (e *TradeEngine) createBotReplacementOrder(filledOrder *models.Order) {
	// Get the market maker bot for this pair
	bot := e.marketMakers[filledOrder.Pair]
	if bot == nil {
		return
	}

	// Create a new order in the opposite direction
	newOrder := &models.Order{
		Pair:   filledOrder.Pair,
		Type:   filledOrder.Type,
		Price:  filledOrder.Price,
		Amount: filledOrder.Amount,
		Status: models.OrderStatusPending,
		IsBot:  true,
		BotID:  filledOrder.BotID,
	}

	// Add the new order to the order book
	e.ProcessOrder(newOrder)
}

// OrderBookUpdate represents an order book update message
type OrderBookUpdate struct {
	Pair      string                  `json:"pair"`
	Bids      []models.OrderBookEntry `json:"bids"`
	Asks      []models.OrderBookEntry `json:"asks"`
	Spread    float64                 `json:"spread"`
	LastPrice float64                 `json:"last_price"`
	Timestamp time.Time               `json:"timestamp"`
}

// broadcastOrderBookUpdate broadcasts order book updates to WebSocket clients
func (e *TradeEngine) broadcastOrderBookUpdate(pair string) {
	orderBook := e.orderBooks[pair]
	if orderBook == nil {
		return
	}

	update := OrderBookUpdate{
		Pair:      pair,
		Bids:      orderBook.GetBids(),
		Asks:      orderBook.GetAsks(),
		Spread:    orderBook.GetSpread(),
		LastPrice: orderBook.LastPrice,
		Timestamp: time.Now(),
	}

	data, err := json.Marshal(update)
	if err != nil {
		log.Printf("Error marshaling order book update: %v", err)
		return
	}

	e.wsHub.Broadcast <- data
}

// broadcastTrade broadcasts a trade to WebSocket clients
func (e *TradeEngine) broadcastTrade(trade *models.Trade) {
	update := map[string]interface{}{
		"type": "trade",
		"data": trade,
	}

	e.wsHandler.BroadcastMessage(trade.Pair, update)
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
	bot := NewMarketMakerBot(orderBook, config, pair)
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
	pair      string
	stopChan  chan struct{}
	botID     string
}

// NewMarketMakerBot creates a new market maker bot
func NewMarketMakerBot(orderBook *models.OrderBook, config MarketMakerConfig, pair string) *MarketMakerBot {
	return &MarketMakerBot{
		orderBook: orderBook,
		config:    config,
		pair:      pair,
		stopChan:  make(chan struct{}),
		botID:     "bot_" + pair + "_" + time.Now().Format("20060102150405"),
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
			Pair:   bot.pair,
			Type:   models.OrderTypeBuy,
			Price:  buyPrice * (1 - float64(i)*0.001), // Slightly lower price for each level
			Amount: bot.config.Volume,
			Status: models.OrderStatusPending,
			IsBot:  true,
			BotID:  bot.botID,
		}

		// Create sell order
		sellOrder := &models.Order{
			Pair:   bot.pair,
			Type:   models.OrderTypeSell,
			Price:  sellPrice * (1 + float64(i)*0.001), // Slightly higher price for each level
			Amount: bot.config.Volume,
			Status: models.OrderStatusPending,
			IsBot:  true,
			BotID:  bot.botID,
		}

		// Add orders to the order book
		bot.orderBook.AddOrder(buyOrder)
		bot.orderBook.AddOrder(sellOrder)
	}
}

// createNewBotOrder creates a new bot order after the previous one was filled
func (e *TradeEngine) createNewBotOrder(pair string) {
	// Add random delay to prevent all bots from creating orders simultaneously
	time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)

	order := &models.Order{
		Pair:      pair,
		Type:      models.OrderTypeBuy,
		Price:     generateRandomPrice(pair),
		Amount:    generateRandomAmount(),
		IsBot:     true,
		Status:    models.OrderStatusPending,
		CreatedAt: time.Now(),
	}

	_, err := e.ProcessOrder(order)
	if err != nil {
		log.Printf("Error creating new bot order: %v", err)
	}
}

// Helper functions for bot order generation
func generateRandomPrice(pair string) float64 {
	// Implement price generation logic based on current market conditions
	return 0.0
}

func generateRandomAmount() float64 {
	// Implement amount generation logic
	return 0.0
}

// TradeResult represents the result of processing an order
type TradeResult struct {
	Order  *models.Order   `json:"order"`
	Trades []*models.Trade `json:"trades"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// @Summary Get all trading pairs
// @Description Retrieves a list of all available trading pairs
// @Tags trading
// @Produce json
// @Success 200 {array} string
// @Router /api/v1/trade/pairs [get]
func (e *TradeEngine) GetTradingPairs() []string {
	e.mu.RLock()
	defer e.mu.RUnlock()

	pairs := make([]string, 0, len(e.orderBooks))
	for pair := range e.orderBooks {
		pairs = append(pairs, pair)
	}
	return pairs
}

// Errors
var (
	ErrOrderBookNotFound = errors.New("order book not found")
)
