package models

import (
	"time"

	"github.com/google/uuid"
)

// FeeTransaction represents a fee transaction record
type FeeTransaction struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null"`
	Amount    float64   `gorm:"not null"`
	Currency  string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"not null"`
}
