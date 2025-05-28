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
	wsHandler    *WebSocketHandler            // WebSocket handler for real-time updates
	mu           sync.RWMutex
}

// NewTradeEngine creates a new trade engine instance
func NewTradeEngine(wsHandler *WebSocketHandler) *TradeEngine {
	return &TradeEngine{
		orderBooks:   make(map[string]*models.OrderBook),
		marketMakers: make(map[string]*MarketMakerBot),
		wsHandler:    wsHandler,
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
	matches := orderBook.MatchOrders()

	// Broadcast order book updates
	e.broadcastOrderBookUpdate(order.Pair)

	// Handle matches
	for _, match := range matches {
		// Broadcast trade
		e.broadcastTrade(match)

		// If one of the orders is from a bot, handle it
		if match.BuyOrder.IsBot || match.SellOrder.IsBot {
			e.handleBotMatch(match)
		}
	}

	return nil
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
		Pair:    filledOrder.Pair,
		Type:    filledOrder.Type,
		Price:   filledOrder.Price,
		Amount:  filledOrder.Amount,
		Status:  models.OrderStatusPending,
		IsBot:   true,
		BotID:   filledOrder.BotID,
	}

	// Add the new order to the order book
	e.ProcessOrder(newOrder)
}

// broadcastOrderBookUpdate broadcasts order book updates to WebSocket clients
func (e *TradeEngine) broadcastOrderBookUpdate(pair string) {
	orderBook := e.orderBooks[pair]
	if orderBook == nil {
		return
	}

	update := map[string]interface{}{
		"type": "orderbook",
		"data": map[string]interface{}{
			"pair":       pair,
			"bids":       orderBook.GetBids(),
			"asks":       orderBook.GetAsks(),
			"spread":     orderBook.GetSpread(),
			"last_price": orderBook.LastPrice,
		},
	}

	e.wsHandler.BroadcastMessage(pair, update)
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
	MaxOrders int          // Maximum number of orders per side
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
			Pair:    bot.pair,
			Type:    models.OrderTypeBuy,
			Price:   buyPrice * (1 - float64(i)*0.001), // Slightly lower price for each level
			Amount:  bot.config.Volume,
			Status:  models.OrderStatusPending,
			IsBot:   true,
			BotID:   bot.botID,
		}

		// Create sell order
		sellOrder := &models.Order{
			Pair:    bot.pair,
			Type:    models.OrderTypeSell,
			Price:   sellPrice * (1 + float64(i)*0.001), // Slightly higher price for each level
			Amount:  bot.config.Volume,
			Status:  models.OrderStatusPending,
			IsBot:   true,
			BotID:   bot.botID,
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
