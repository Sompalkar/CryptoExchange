package main

import (
	"exchange/controllers"
	"exchange/middleware"
	"exchange/routes"
	"exchange/services"
	"exchange/websocket"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Initialize database
	// go run main.go
	//
	//postgresql://postgres:S@mm7578@db.cikslxgwbjvvfictuzlu.supabase.co:5432/postgres
	db, err := gorm.Open(postgres.Open("postgresql://postgres:S@mm7578@db.cikslxgwbjvvfictuzlu.supabase.co:5432/postgres"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize services
	feeService := services.NewFeeService(0.001, 0.002) // 0.1% maker fee, 0.2% taker fee

	// Initialize WebSocket pool
	pool := websocket.NewPool()
	go pool.Start()

	// Initialize controllers
	userController := controllers.NewUserController(db)
	tradeController := controllers.NewTradeController(db)
	orderController := controllers.AddDatabaseRefernce(db, feeService)

	// Initialize rate limiter
	rateLimiter := middleware.NewRateLimiter(100, time.Minute)

	// Initialize router
	router := mux.NewRouter()

	// Apply rate limiting middleware
	router.Use(rateLimiter.RateLimit)

	// Setup routes
	routes.UserRoutes(router, userController)
	routes.TradeRoutes(router, tradeController)
	routes.OrderRoutes(router, orderController)
	routes.WebSocketRoutes(pool)

	// Setup server
	server := &http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server
	log.Println("Server starting on :8080")
	log.Fatal(server.ListenAndServe())
}
