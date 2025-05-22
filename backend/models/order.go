package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderType represents the type of order (BUY or SELL)
type OrderType string

// OrderStatus represents the current status of an order
type OrderStatus string

// Constants for order types and statuses
const (
	// Order Types
	OrderTypeBuy  OrderType = "BUY"  // Buy order
	OrderTypeSell OrderType = "SELL" // Sell order

	// Order Statuses
	OrderStatusPending   OrderStatus = "PENDING"   // Order is waiting to be matched
	OrderStatusCompleted OrderStatus = "COMPLETED" // Order has been fully executed
	OrderStatusCancelled OrderStatus = "CANCELLED" // Order has been cancelled
)

// Order represents a trading order in the system
// Contains all information about a buy or sell order
type Order struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`         // Unique identifier for the order
	UserID    uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`       // ID of the user who placed the order
	Type      OrderType      `gorm:"type:varchar(10);not null" json:"type"`   // Type of order (BUY/SELL)
	Amount    float64        `gorm:"not null" json:"amount"`                  // Amount of cryptocurrency to trade
	Price     float64        `gorm:"not null" json:"price"`                   // Price per unit of cryptocurrency
	Status    OrderStatus    `gorm:"type:varchar(20);not null" json:"status"` // Current status of the order
	CreatedAt time.Time      `json:"created_at"`                              // Order creation timestamp
	UpdatedAt time.Time      `json:"updated_at"`                              // Last update timestamp
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`                          // Soft delete support
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

// IsActive returns true if the order is in a state where it can be matched
func (o *Order) IsActive() bool {
	return o.Status == OrderStatusPending
}
