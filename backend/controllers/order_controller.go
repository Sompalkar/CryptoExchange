package controllers

import (
	"encoding/json"
	"exchange/models"
	"exchange/services"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderController handles all order-related operations
type OrderController struct {
	Database   *gorm.DB
	OrderBook  *models.OrderBook
	FeeService *services.FeeService
}

// AddDatabaseRefernce creates a new OrderController instance
func AddDatabaseRefernce(db *gorm.DB, feeService *services.FeeService) *OrderController {
	return &OrderController{
		Database:   db,
		OrderBook:  models.NewOrderBook(),
		FeeService: feeService,
	}
}

// @Summary Create a new order
// @Description Creates a new order and adds it to the order book
// @Tags orders
// @Accept json
// @Produce json
// @Param order body models.Order true "Order object"
// @Success 201 {object} models.Order
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security ApiKeyAuth
// @Router /api/v1/orders [post]
func (c *OrderController) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var order models.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user ID from JWT token and convert to UUID
	userIDStr := r.Context().Value("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}
	order.UserID = userID
	order.Status = models.OrderStatusPending

	// Add order to database
	if err := c.Database.Create(&order).Error; err != nil {
		http.Error(w, "Error creating order", http.StatusInternalServerError)
		return
	}

	// Add order to order book for matching
	c.OrderBook.AddOrder(&order)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(order)
}

// @Summary Get user's orders
// @Description Retrieves all orders for the authenticated user
// @Tags orders
// @Produce json
// @Param status query string false "Filter by order status (pending, filled, cancelled, rejected)"
// @Param pair query string false "Filter by trading pair"
// @Param limit query int false "Limit the number of results" default(50)
// @Param offset query int false "Offset for pagination" default(0)
// @Success 200 {array} models.Order
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security ApiKeyAuth
// @Router /api/v1/orders [get]
func (c *OrderController) GetOrders(w http.ResponseWriter, r *http.Request) {
	var orders []models.Order
	userID := r.Context().Value("user_id").(string)

	query := c.Database.Where("user_id = ?", userID)

	// Apply filters
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if pair := r.URL.Query().Get("pair"); pair != "" {
		query = query.Where("pair = ?", pair)
	}

	// Apply pagination
	limit := 50
	offset := 0
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		limit = parseInt(limitStr, 50)
	}
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		offset = parseInt(offsetStr, 0)
	}

	if err := query.Limit(limit).Offset(offset).Find(&orders).Error; err != nil {
		http.Error(w, "Error fetching orders", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(orders)
}

// @Summary Cancel an order
// @Description Cancels a pending order
// @Tags orders
// @Produce json
// @Param id query string true "Order ID"
// @Success 200 {object} models.Order
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security ApiKeyAuth
// @Router /api/v1/orders/cancel [post]
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

	// Remove order from order book
	c.OrderBook.CancelOrder(&order)

	order.Status = models.OrderStatusCancelled
	if err := c.Database.Save(&order).Error; err != nil {
		http.Error(w, "Error cancelling order", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(order)
}

// @Summary Get current order book
// @Description Retrieves the current state of the order book
// @Tags orders
// @Produce json
// @Param pair query string true "Trading pair"
// @Param depth query int false "Order book depth" default(20)
// @Success 200 {object} OrderBookResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/orders/book [get]
func (c *OrderController) GetOrderBook(w http.ResponseWriter, r *http.Request) {
	pair := r.URL.Query().Get("pair")
	if pair == "" {
		http.Error(w, "Missing trading pair", http.StatusBadRequest)
		return
	}

	depth := 20
	if depthStr := r.URL.Query().Get("depth"); depthStr != "" {
		depth = parseInt(depthStr, 20)
	}

	response := OrderBookResponse{
		Bids:      c.OrderBook.GetBids()[:min(depth, len(c.OrderBook.GetBids()))],
		Asks:      c.OrderBook.GetAsks()[:min(depth, len(c.OrderBook.GetAsks()))],
		Spread:    c.OrderBook.GetSpread(),
		LastPrice: c.OrderBook.LastPrice,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// OrderBookResponse represents the order book state
type OrderBookResponse struct {
	Bids      []models.OrderBookEntry `json:"bids"`
	Asks      []models.OrderBookEntry `json:"asks"`
	Spread    float64                 `json:"spread"`
	LastPrice float64                 `json:"last_price"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// Helper function to parse integers with default value
func parseInt(s string, defaultValue int) int {
	if s == "" {
		return defaultValue
	}
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	if err != nil {
		return defaultValue
	}
	return result
}

// Helper function to get minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
