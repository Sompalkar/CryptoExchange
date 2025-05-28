package controllers

import (
	"encoding/json"
	"exchange/models"
	"net/http"

	"gorm.io/gorm"
)

// OrderController handles all order-related operations
type OrderController struct {
	Database  *gorm.DB
	OrderBook *models.OrderBook
}




// AddDatabaseRefernce creates a new OrderController instance
func AddDatabaseRefernce(db *gorm.DB) *OrderController {
	return &OrderController{
		Database:  db,
		OrderBook: models.NewOrderBook(),
	}
}



// CreateOrder godoc
// @Summary Create a new order
// @Description Creates a new order and adds it to the order book
// @Tags orders
// @Accept json
// @Produce json
// @Param order body models.Order true "Order object"
// @Success 201 {object} models.Order
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /orders [post]
func (c *OrderController) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var order models.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get user ID from JWT token
	userID := r.Context().Value("user_id").(string)
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










// GetOrders godoc
// @Summary Get user's orders
// @Description Retrieves all orders for the authenticated user
// @Tags orders
// @Produce json
// @Success 200 {array} models.Order
// @Failure 500 {object} ErrorResponse
// @Router /orders [get]
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












// CancelOrder godoc
// @Summary Cancel an order
// @Description Cancels a pending order
// @Tags orders
// @Produce json
// @Param id query string true "Order ID"
// @Success 200 {object} models.Order
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /orders/cancel [post]
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













// GetOrderBook godoc
// @Summary Get current order book
// @Description Retrieves the current state of the order book
// @Tags orders
// @Produce json
// @Success 200 {object} OrderBookResponse
// @Router /orders/book [get]
func (c *OrderController) GetOrderBook(w http.ResponseWriter, r *http.Request) {
	response := OrderBookResponse{
		Bids:      c.OrderBook.GetBids(),
		Asks:      c.OrderBook.GetAsks(),
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
