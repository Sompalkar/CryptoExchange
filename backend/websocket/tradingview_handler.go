package websocket

import (
	"encoding/json"
	"exchange/models"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

// TradingViewMessage represents a message format for TradingView
type TradingViewMessage struct {
	Type    string      `json:"type"`
	Channel string      `json:"channel"`
	Data    interface{} `json:"data"`
}

// OHLCVData represents candlestick data
type OHLCVData struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

// OrderBookData represents order book data
type OrderBookData struct {
	Bids [][]float64 `json:"bids"` // [price, amount]
	Asks [][]float64 `json:"asks"` // [price, amount]
}

// HandleTradingViewMessage processes messages from TradingView
func (c *Client) HandleTradingViewMessage(message []byte) {
	var tvMsg TradingViewMessage
	if err := json.Unmarshal(message, &tvMsg); err != nil {
		log.Printf("Error parsing TradingView message: %v", err)
		return
	}

	switch tvMsg.Type {
	case "subscribe":
		c.handleSubscription(tvMsg.Channel)
	case "unsubscribe":
		// Handle unsubscription if needed
		log.Printf("Unsubscribed from channel: %s", tvMsg.Channel)
	}
}

// handleSubscription handles channel subscriptions
func (c *Client) handleSubscription(channel string) {
	switch {
	case channel == "orderbook":
		// Send initial order book data
		c.sendOrderBookData()
	case channel == "ohlcv":
		// Send initial OHLCV data
		c.sendOHLCVData()
	case channel == "trades":
		// Send recent trades
		c.sendRecentTrades()
	}
}

// sendOrderBookData sends order book data to the client
func (c *Client) sendOrderBookData() {
	// Get order book data from the pool
	orderBook := c.Pool.GetOrderBook()

	// Get bids and asks using the correct methods
	bids := orderBook.GetBids()
	asks := orderBook.GetAsks()

	data := OrderBookData{
		Bids: make([][]float64, len(bids)),
		Asks: make([][]float64, len(asks)),
	}

	for i, bid := range bids {
		data.Bids[i] = []float64{bid.Price, bid.Amount}
	}
	for i, ask := range asks {
		data.Asks[i] = []float64{ask.Price, ask.Amount}
	}

	msg := TradingViewMessage{
		Type:    "orderbook",
		Channel: "orderbook",
		Data:    data,
	}

	c.sendMessage(msg)
}

// sendOHLCVData sends OHLCV data to the client
func (c *Client) sendOHLCVData() {
	// Get OHLCV data from your data source
	ohlcv := []OHLCVData{
		{
			Time:   time.Now().Unix(),
			Open:   100.0,
			High:   105.0,
			Low:    95.0,
			Close:  102.0,
			Volume: 1000.0,
		},
		// Add more historical data as needed
	}

	msg := TradingViewMessage{
		Type:    "ohlcv",
		Channel: "ohlcv",
		Data:    ohlcv,
	}

	c.sendMessage(msg)
}

// sendRecentTrades sends recent trades to the client
func (c *Client) sendRecentTrades() {
	// Get recent trades from your data source
	trades := []models.Trade{
		// Add recent trades here
	}

	msg := TradingViewMessage{
		Type:    "trades",
		Channel: "trades",
		Data:    trades,
	}

	c.sendMessage(msg)
}

// sendMessage sends a message to the client
func (c *Client) sendMessage(msg TradingViewMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Printf("Error sending message: %v", err)
	}
}

