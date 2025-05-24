package controllers

import (
	"encoding/json"
	"exchange/models"
	"net/http"
	"gorm.io/gorm"
)

type OrderController struct {
	Database *gorm.DB
}

func AddDatabaseRefernce(db *gorm.DB) *OrderController {
	return &OrderController{Database: db}
}

func (c *OrderController) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var order models.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Get user ID from JWT token
	// order.UserID =r.Context().Value("user_id").(string)
	order.Status = models.OrderStatusPending

	if err := c.Database.Create(&order).Error; err != nil {
		http.Error(w, "Error creating order", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

func (c *OrderController) GetOrders(w http.ResponseWriter, r *http.Request) {
	var orders []models.Order
	userID := r.Context().Value("user_id").(string)

	if err := c.Database.Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		http.Error(w, "Error fetching orders", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(orders)
}



func (c *OrderController) CancelOrder(w http.ResponseWriter, r *http.Request) {
	orderID := r.URL.Query().Get("id")
	userID := r.Context().Value("user_id").(string)

	var order models.Order
	if err := c.Database.Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	if order.Status != models.OrderStatusPending {
		http.Error(w, "Can only cancel pending orders", http.StatusBadRequest)
		return
	}

	order.Status = models.OrderStatusCancelled
	if err := c.Database.Save(&order).Error; err != nil {
		http.Error(w, "Error cancelling order", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(order)
}


