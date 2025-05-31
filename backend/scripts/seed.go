package main

import (
	"exchange/models"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Connect to database
	db, err := gorm.Open(postgres.Open("postgresql://postgres:S@mm7578@db.cikslxgwbjvvfictuzlu.supabase.co:5432/postgres"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	db.AutoMigrate(&models.User{}, &models.Order{}, &models.Trade{}, &models.FeeTransaction{})

	// Create demo users
	users := []models.User{
		{
			ID:        uuid.New(),
			Email:     "alice@example.com",
			Name:      "Alice",
			Password:  "$2a$10$abcdefghijklmnopqrstuv", // Hashed password
			Balance:   10000.0,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New(),
			Email:     "bob@example.com",
			Name:      "Bob",
			Password:  "$2a$10$abcdefghijklmnopqrstuv", // Hashed password
			Balance:   5000.0,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, user := range users {
		if err := db.Create(&user).Error; err != nil {
			log.Printf("Error creating user %s: %v", user.Name, err)
		}
	}

	// Create demo orders
	orders := []models.Order{
		{
			ID:        uuid.New(),
			UserID:    users[0].ID,
			Pair:      "BTC/USDT",
			Type:      models.OrderTypeBuy,
			Price:     50000.0,
			Amount:    0.1,
			Status:    models.OrderStatusPending,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New(),
			UserID:    users[1].ID,
			Pair:      "BTC/USDT",
			Type:      models.OrderTypeSell,
			Price:     50100.0,
			Amount:    0.1,
			Status:    models.OrderStatusPending,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, order := range orders {
		if err := db.Create(&order).Error; err != nil {
			log.Printf("Error creating order: %v", err)
		}
	}

	// Create demo trades
	trades := []models.Trade{
		{
			ID:          uuid.New(),
			Pair:        "BTC/USDT",
			Price:       50000.0,
			Amount:      0.05,
			BuyOrderID:  orders[0].ID,
			SellOrderID: orders[1].ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New(),
			Pair:        "BTC/USDT",
			Price:       50100.0,
			Amount:      0.05,
			BuyOrderID:  orders[0].ID,
			SellOrderID: orders[1].ID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, trade := range trades {
		if err := db.Create(&trade).Error; err != nil {
			log.Printf("Error creating trade: %v", err)
		}
	}

	// Create demo fee transactions
	feeTransactions := []models.FeeTransaction{
		{
			ID:        uuid.New(),
			UserID:    users[0].ID,
			OrderID:   orders[0].ID,
			Amount:    25.0,
			Currency:  "USDT",
			CreatedAt: time.Now(),
		},
		{
			ID:        uuid.New(),
			UserID:    users[1].ID,
			OrderID:   orders[1].ID,
			Amount:    25.05,
			Currency:  "USDT",
			CreatedAt: time.Now(),
		},
	}

	for _, feeTx := range feeTransactions {
		if err := db.Create(&feeTx).Error; err != nil {
			log.Printf("Error creating fee transaction: %v", err)
		}
	}

	log.Println("Database seeded successfully!")
}
