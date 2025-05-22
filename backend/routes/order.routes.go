package routes

import (
	"exchange/controllers"

	"github.com/gorilla/mux"
)

func OrderRoutes(router *mux.Router, orderController *controllers.OrderController) {
	router.HandleFunc("/api/orders", orderController.CreateOrder).Methods("POST")
	router.HandleFunc("/api/orders", orderController.GetOrders).Methods("GET")
	router.HandleFunc("/api/orders/cancel", orderController.CancelOrder).Methods("POST")
}
