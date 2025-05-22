package bots

import (
	"math/rand"
	"time"

	"exchange/models"
)

// MarketMakerBot represents a bot that provides liquidity to the market
// by placing buy and sell orders around the current market price
type MarketMakerBot struct {
	orderBook *models.OrderBook
	spread    float64       // Target spread between buy and sell orders
	volume    float64       // Target volume per order
	interval  time.Duration // Time between order updates
	stopChan  chan struct{}
}

// NewMarketMakerBot creates a new market maker bot
func NewMarketMakerBot(orderBook *models.OrderBook, spread, volume float64, interval time.Duration) *MarketMakerBot {
	return &MarketMakerBot{
		orderBook: orderBook,
		spread:    spread,
		volume:    volume,
		interval:  interval,
		stopChan:  make(chan struct{}),
	}
}

// Start begins the market maker bot's operation
func (bot *MarketMakerBot) Start() {
	ticker := time.NewTicker(bot.interval)
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
	buyPrice := midPrice * (1 - bot.spread/2)
	sellPrice := midPrice * (1 + bot.spread/2)

	// Add some randomness to the prices
	buyPrice *= 1 + (rand.Float64()-0.5)*0.001  // ±0.05% random variation
	sellPrice *= 1 + (rand.Float64()-0.5)*0.001 // ±0.05% random variation

	// Add some randomness to the volume
	volume := bot.volume * (1 + (rand.Float64()-0.5)*0.2) // ±10% random variation

	// Create buy order
	buyOrder := &models.Order{
		Type:   models.OrderTypeBuy,
		Price:  buyPrice,
		Amount: volume,
		Status: models.OrderStatusPending,
	}

	// Create sell order
	sellOrder := &models.Order{
		Type:   models.OrderTypeSell,
		Price:  sellPrice,
		Amount: volume,
		Status: models.OrderStatusPending,
	}

	// Add orders to the order book
	bot.orderBook.AddOrder(buyOrder)
	bot.orderBook.AddOrder(sellOrder)
}

// AdjustParameters allows dynamic adjustment of bot parameters
func (bot *MarketMakerBot) AdjustParameters(spread, volume float64, interval time.Duration) {
	bot.spread = spread
	bot.volume = volume
	bot.interval = interval




	
}
