package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Trade represents a completed trade between two orders

// A trade is created when a buy order matches with a sell order
type Trade struct {
	ID         uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`         // Unique identifier for the trade
	Pair       string         `gorm:"not null" json:"pair"`           // Trading pair
	Price      float64        `gorm:"not null" json:"price"`          // Execution price
	Amount     float64        `gorm:"not null" json:"amount"`         // Trade amount
	BuyOrder   *Order         `gorm:"-" json:"buy_order"`             // Buy order reference
	SellOrder  *Order         `gorm:"-" json:"sell_order"`            // Sell order reference
	BuyOrderID uuid.UUID      `gorm:"type:uuid;not null" json:"buy_order_id"`  // ID of the buy order
	SellOrderID uuid.UUID     `gorm:"type:uuid;not null" json:"sell_order_id"` // ID of the sell order
	IsBotTrade bool           `gorm:"not null;default:false" json:"is_bot_trade"` // Whether this trade involved a bot
	CreatedAt  time.Time      `json:"created_at"`                              // Trade execution timestamp
	UpdatedAt  time.Time      `json:"updated_at"`                              // Last update timestamp
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`                          // Soft delete support
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

// IsBotInvolved returns true if either the buy or sell order is from a bot
func (t *Trade) IsBotInvolved() bool {
	return t.BuyOrder.IsBot || t.SellOrder.IsBot
}

// GetBotOrder returns the bot order if one exists
func (t *Trade) GetBotOrder() *Order {
	if t.BuyOrder.IsBot {
		return t.BuyOrder
	}
	if t.SellOrder.IsBot {
		return t.SellOrder
	}
	return nil
}

// GetUserOrder returns the user order
func (t *Trade) GetUserOrder() *Order {
	if !t.BuyOrder.IsBot {
		return t.BuyOrder
	}
	if !t.SellOrder.IsBot {
		return t.SellOrder
	}
	return nil
}

// ToJSON converts the trade to a JSON-friendly format
func (t *Trade) ToJSON() map[string]interface{} {
	return map[string]interface{}{
		"id":            t.ID,
		"pair":          t.Pair,
		"price":         t.Price,
		"amount":        t.Amount,
		"total":         t.CalculateTotal(),
		"buy_order_id":  t.BuyOrderID,
		"sell_order_id": t.SellOrderID,
		"is_bot_trade":  t.IsBotTrade,
		"created_at":    t.CreatedAt,
	}
}
