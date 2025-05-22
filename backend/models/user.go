package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a trading platform user
// Contains user authentication and account information
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"` // Unique identifier for the user
	Email     string         `gorm:"unique;not null" json:"email"`    // User's email (unique)
	Password  string         `gorm:"not null" json:"-"`               // Hashed password (not exposed in JSON)
	Name      string         `gorm:"not null" json:"name"`            // User's full name
	Balance   float64        `gorm:"default:0" json:"balance"`        // User's available balance
	CreatedAt time.Time      `json:"created_at"`                      // Account creation timestamp
	UpdatedAt time.Time      `json:"updated_at"`                      // Last update timestamp
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`                  // Soft delete support
}

// BeforeCreate is a GORM hook that generates a new UUID before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New()
	return nil
}
