package routes

import (
	"exchange/controllers"

	"github.com/gorilla/mux"
)

func TradeRoutes(router *mux.Router, tradeController *controllers.TradeController) {
	router.HandleFunc("/api/trades", tradeController.GetTrades).Methods("GET")
	router.HandleFunc("/api/trades/history", tradeController.GetTradeHistory).Methods("GET")
}
