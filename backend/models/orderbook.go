package models

import (
	"container/heap"
	"sort"
	"sync"
	"time"
)

// OrderBookEntry represents a price level in the order book

type OrderBookEntry struct {
	Price  float64  // Price level
	Amount float64  // Total amount at this price level
	Orders []*Order // List of orders at this price level

}

// OrderBook represents the current state of the market
// Contains buy and sell orders organized by price

type OrderBook struct {
	mu sync.RWMutex

	// Buy orders (sorted by price in descending order)
	BuyOrders *OrderHeap

	// Sell orders (sorted by price in ascending order)
	SellOrders *OrderHeap

	// Last trade price
	LastPrice float64

	// 24h statistics
	High24h   float64
	Low24h    float64
	Volume24h float64

	// Recent matches
	matches []*Trade
}

// NewOrderBook creates a new empty order book
func NewOrderBook() *OrderBook {
	return &OrderBook{
		BuyOrders:  &OrderHeap{},
		SellOrders: &OrderHeap{},
		matches:    make([]*Trade, 0),
	}
}

// AddOrder adds a new order to the order book
func (ob *OrderBook) AddOrder(order *Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	if order.Type == OrderTypeBuy {
		heap.Push(ob.BuyOrders, order)
	} else {
		heap.Push(ob.SellOrders, order)
	}

	// Try to match orders
	ob.MatchOrders()
}

// CancelOrder removes an order from the order book
func (ob *OrderBook) CancelOrder(order *Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	if order.Type == OrderTypeBuy {
		ob.BuyOrders.Remove(order)
	} else {
		ob.SellOrders.Remove(order)
	}
}

// GetBestBid returns the highest buy order price
func (ob *OrderBook) GetBestBid() float64 {
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	if ob.BuyOrders.Len() == 0 {
		return 0
	}
	return ob.BuyOrders.Peek().Price
}

// GetBestAsk returns the lowest sell order price
func (ob *OrderBook) GetBestAsk() float64 {
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	if ob.SellOrders.Len() == 0 {
		return 0
	}
	return ob.SellOrders.Peek().Price
}

// GetSpread returns the difference between best ask and best bid
func (ob *OrderBook) GetSpread() float64 {
	bestAsk := ob.GetBestAsk()
	bestBid := ob.GetBestBid()
	if bestAsk == 0 || bestBid == 0 {
		return 0
	}
	return bestAsk - bestBid
}

// MatchOrders attempts to match buy and sell orders
func (ob *OrderBook) MatchOrders() {
	ob.matches = make([]*Trade, 0) // Clear previous matches

	for ob.BuyOrders.Len() > 0 && ob.SellOrders.Len() > 0 {
		bestBuy := ob.BuyOrders.Peek()
		bestSell := ob.SellOrders.Peek()

		// Check if orders can be matched
		if bestBuy.Price < bestSell.Price {
			break
		}

		// Calculate the amount to trade
		amount := minFloat64(bestBuy.Amount, bestSell.Amount)

		// Create and record the trade
		trade := &Trade{
			BuyOrderID:  bestBuy.ID,
			SellOrderID: bestSell.ID,
			Amount:      amount,
			Price:       bestSell.Price, // Use the sell price as the execution price
			BuyOrder:    bestBuy,
			SellOrder:   bestSell,
			CreatedAt:   time.Now(),
		}

		// Update order amounts
		bestBuy.Amount -= amount
		bestSell.Amount -= amount

		// Remove filled orders
		if bestBuy.Amount == 0 {
			heap.Pop(ob.BuyOrders)
		}
		if bestSell.Amount == 0 {
			heap.Pop(ob.SellOrders)
		}

		// Update last price and statistics
		ob.LastPrice = trade.Price
		ob.updateStatistics(trade)

		// Add to matches
		ob.matches = append(ob.matches, trade)
	}
}

// updateStatistics updates the order book's 24h statistics
func (ob *OrderBook) updateStatistics(trade *Trade) {
	ob.Volume24h += trade.Amount
	if trade.Price > ob.High24h {
		ob.High24h = trade.Price
	}
	if ob.Low24h == 0 || trade.Price < ob.Low24h {
		ob.Low24h = trade.Price
	}
}

// Helper function to get minimum of two float64 values
func minFloat64(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// GetBids returns all buy orders sorted by price in descending order
func (ob *OrderBook) GetBids() []OrderBookEntry {
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	entries := make([]OrderBookEntry, 0)
	seenPrices := make(map[float64]int)

	// Group orders by price
	for _, order := range *ob.BuyOrders {
		if idx, exists := seenPrices[order.Price]; exists {
			entries[idx].Amount += order.Amount
			entries[idx].Orders = append(entries[idx].Orders, order)
		} else {
			entries = append(entries, OrderBookEntry{
				Price:  order.Price,
				Amount: order.Amount,
				Orders: []*Order{order},
			})
			seenPrices[order.Price] = len(entries) - 1
		}
	}

	// Sort by price in descending order
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Price > entries[j].Price
	})

	return entries
}

// GetAsks returns all sell orders sorted by price in ascending order
func (ob *OrderBook) GetAsks() []OrderBookEntry {
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	entries := make([]OrderBookEntry, 0)
	seenPrices := make(map[float64]int)

	// Group orders by price
	for _, order := range *ob.SellOrders {
		if idx, exists := seenPrices[order.Price]; exists {
			entries[idx].Amount += order.Amount
			entries[idx].Orders = append(entries[idx].Orders, order)
		} else {
			entries = append(entries, OrderBookEntry{
				Price:  order.Price,
				Amount: order.Amount,
				Orders: []*Order{order},
			})
			seenPrices[order.Price] = len(entries) - 1
		}
	}

	// Sort by price in ascending order
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Price < entries[j].Price
	})

	return entries
}

// GetMatches returns the matches that occurred during the last order processing
func (ob *OrderBook) GetMatches() []*Trade {
	ob.mu.RLock()
	defer ob.mu.RUnlock()
	return ob.matches
}
