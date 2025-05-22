package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Trade represents a completed trade between two orders
// A trade is created when a buy order matches with a sell order
type Trade struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`         // Unique identifier for the trade
	BuyOrderID  uuid.UUID      `gorm:"type:uuid;not null" json:"buy_order_id"`  // ID of the buy order
	SellOrderID uuid.UUID      `gorm:"type:uuid;not null" json:"sell_order_id"` // ID of the sell order
	Amount      float64        `gorm:"not null" json:"amount"`                  // Amount of cryptocurrency traded
	Price       float64        `gorm:"not null" json:"price"`                   // Price at which the trade occurred
	CreatedAt   time.Time      `json:"created_at"`                              // Trade execution timestamp
	UpdatedAt   time.Time      `json:"updated_at"`                              // Last update timestamp
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`                          // Soft delete support
}

// BeforeCreate is a GORM hook that generates a new UUID before creating a trade
func (t *Trade) BeforeCreate(tx *gorm.DB) error {
	t.ID = uuid.New()
	return nil
}

// CalculateTotal returns the total value of the trade (amount * price)
func (t *Trade) CalculateTotal() float64 {
	return t.Amount * t.Price
}

// CalculateFee calculates the trading fee for this trade
// Fee is typically a percentage of the total trade value
func (t *Trade) CalculateFee(feeRate float64) float64 {
	return t.CalculateTotal() * feeRate
}
