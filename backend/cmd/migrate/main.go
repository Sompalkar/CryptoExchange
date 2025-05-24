package main

import (
	"exchange/models"
	"log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Connect to database
	db, err := gorm.Open(postgres.Open("postgresql://postgres:S@mm7578@db.cikslxgwbjvvfictuzlu.supabase.co:5432/postgres"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	log.Println("Running database migrations...")
	err = db.AutoMigrate(&models.User{}, &models.Order{}, &models.Trade{})
	if err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	log.Println("Migrations completed successfully!")
}



//go run backend/cmd/migrate/main.go