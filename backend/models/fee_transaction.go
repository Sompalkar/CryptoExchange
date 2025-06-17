// package models

// import (
// 	"time"

// 	"github.com/google/uuid"
// )

// // FeeTransaction represents a fee transaction record
// type FeeTransaction struct {
// 	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
// 	UserID    uuid.UUID `gorm:"type:uuid;not null"`
// 	OrderID   uuid.UUID `gorm:"type:uuid;not null"`
// 	Amount    float64   `gorm:"not null"`
// 	Currency  string    `gorm:"not null"`
// 	CreatedAt time.Time `gorm:"not null"`
// }



package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FeeTransaction struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	OrderID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"order_id"`
	Amount    float64        `gorm:"not null" json:"amount"`
	Currency  string         `gorm:"not null" json:"currency"`
	CreatedAt time.Time      `gorm:"not null" json:"created_at"`
}

func (f *FeeTransaction) BeforeCreate(tx *gorm.DB) error {
	f.ID = uuid.New()
	return nil
}
