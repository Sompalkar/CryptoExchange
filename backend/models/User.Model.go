package models

import (
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

type User struct {
    ID       string `gorm:"primaryKey;size:36" json:"id"`                          // :contentReference[oaicite:14]{index=14}
    Username string `gorm:"uniqueIndex;size:64" json:"username" validate:"required,alphanum,min=3,max=64"` // :contentReference[oaicite:15]{index=15}
    Password string `gorm:"size:255" json:"password" validate:"required,min=8"`    // :contentReference[oaicite:16]{index=16}
    Email    string `gorm:"uniqueIndex;size:128" json:"email" validate:"required,email"`           // :contentReference[oaicite:17]{index=17}
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
    if u.ID == "" {
        u.ID = uuid.NewString() // :contentReference[oaicite:18]{index=18}
    }
    hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashed) // :contentReference[oaicite:19]{index=19}
    return nil
}
