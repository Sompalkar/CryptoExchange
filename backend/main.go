package main

import (
	"exchange/controllers"
	"exchange/models"
	"exchange/routes"
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
	// DataBase_URL := os.Getenv("DATABASE_URL")


	// if DataBase_URL == "" {
	// 	DataBase_URL = "host=localhost user=postgres password=postgres dbname=exchange port=5432 sslmode=disable"
	// }

	db, err := gorm.Open(postgres.Open("postgresql://postgres:S@mm7578@db.cikslxgwbjvvfictuzlu.supabase.co:5432/postgres"))

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate models
	db.AutoMigrate(&models.User{}, &models.Order{}, &models.Trade{})

	// Initialize WebSocket pool
	pool := websocket.NewPool()
	go pool.Start()

	// Initialize controllers
	userController := controllers.NewUserController(db)
	// orderController := controllers.NewOrderController(db)
	tradeController := controllers.NewTradeController(db)

	// Initialize router
	router := mux.NewRouter()

	// Setup routes
	routes.UserRoutes(router, userController)
	// routes.OrderRoutes(router, orderController)
	routes.TradeRoutes(router, tradeController)
	routes.WebSocketRoutes(pool)

	// Setup CORS middleware
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

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
