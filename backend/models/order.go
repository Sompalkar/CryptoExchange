package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderType represents the type of order
type OrderType string

const (
	OrderTypeBuy  OrderType = "buy"
	OrderTypeSell OrderType = "sell"
)

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusFilled    OrderStatus = "filled"
	OrderStatusCancelled OrderStatus = "cancelled"
	OrderStatusRejected  OrderStatus = "rejected"
)

// Order represents a trading order
type Order struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	Pair      string         `gorm:"not null" json:"pair"`           // Trading pair (e.g., "BTC/USDT")
	Type      OrderType      `gorm:"not null" json:"type"`           // Buy or sell
	Price     float64        `gorm:"not null" json:"price"`          // Order price
	Amount    float64        `gorm:"not null" json:"amount"`         // Order amount
	Status    OrderStatus    `gorm:"not null" json:"status"`         // Order status
	IsBot     bool           `gorm:"not null;default:false" json:"is_bot"` // Whether this is a bot order
	BotID     string         `gorm:"index" json:"bot_id,omitempty"`  // ID of the bot that created this order
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate is a GORM hook that generates a new UUID before creating an order
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	o.ID = uuid.New()
	return nil
}

// CalculateTotal returns the total value of the order (amount * price)
func (o *Order) CalculateTotal() float64 {
	return o.Amount * o.Price
}

// IsValid checks if the order is valid
func (o *Order) IsValid() bool {
	return o.Price > 0 && o.Amount > 0 && o.Pair != ""
}

// CanMatchWith checks if this order can match with another order
func (o *Order) CanMatchWith(other *Order) bool {
	if o.Type == other.Type {
		return false // Same type orders can't match
	}

	if o.Type == OrderTypeBuy {
		return o.Price >= other.Price // Buy order price must be >= sell order price
	}
	return o.Price <= other.Price // Sell order price must be <= buy order price
}

// MatchWith matches this order with another order
func (o *Order) MatchWith(other *Order) *Trade {
	if !o.CanMatchWith(other) {
		return nil
	}

	// Determine the execution price and amount
	executionPrice := o.Price
	if o.Type == OrderTypeBuy {
		executionPrice = other.Price
	}

	executionAmount := min(o.Amount, other.Amount)

	// Create the trade
	trade := &Trade{
		Pair:       o.Pair,
		Price:      executionPrice,
		Amount:     executionAmount,
		BuyOrder:   o,
		SellOrder:  other,
		CreatedAt:  time.Now(),
	}

	// Update order amounts
	o.Amount -= executionAmount
	other.Amount -= executionAmount

	// Update order statuses
	if o.Amount == 0 {
		o.Status = OrderStatusFilled
	}
	if other.Amount == 0 {
		other.Status = OrderStatusFilled
	}

	return trade
}

// Helper function to get minimum of two float64 values
func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
