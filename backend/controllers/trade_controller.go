package controllers

import (
	"encoding/json"
	"net/http"

	"exchange/models"

	"gorm.io/gorm"
)

type TradeController struct {
	DB *gorm.DB
}

func NewTradeController(db *gorm.DB) *TradeController {
	return &TradeController{DB: db}
}








func (c *TradeController) GetTrades(w http.ResponseWriter, r *http.Request) {
	var trades []models.Trade
	userID := r.Context().Value("user_id").(string)

	// Get trades where user is either buyer or seller
	if err := c.DB.Joins("JOIN orders ON trades.buy_order_id = orders.id OR trades.sell_order_id = orders.id").
		Where("orders.user_id = ?", userID).
		Find(&trades).Error; err != nil {
		http.Error(w, "Error fetching trades", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(trades)
}










func (c *TradeController) GetTradeHistory(w http.ResponseWriter, r *http.Request) {
	var trades []models.Trade
	if err := c.DB.Order("created_at desc").Limit(100).Find(&trades).Error; err != nil {
		http.Error(w, "Error fetching trade history", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(trades)
}
