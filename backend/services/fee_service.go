package services

import (
	"exchange/models"
	"math"
	"time"

	"gorm.io/gorm"
)

// FeeService handles fee calculations and collection
type FeeService struct {
	MakerFeeRate float64
	TakerFeeRate float64
}

// NewFeeService creates a new FeeService instance
func NewFeeService(makerFeeRate, takerFeeRate float64) *FeeService {
	return &FeeService{
		MakerFeeRate: makerFeeRate,
		TakerFeeRate: takerFeeRate,
	}
}

// CalculateFee calculates the fee for an order
func (fs *FeeService) CalculateFee(order *models.Order, isMaker bool) float64 {
	feeRate := fs.MakerFeeRate
	if !isMaker {
		feeRate = fs.TakerFeeRate
	}

	// Calculate fee based on order amount and price
	fee := order.Amount * order.Price * feeRate

	// Round to 8 decimal places
	return math.Round(fee*100000000) / 100000000
}

// CollectFee deducts the fee from user balance
func (fs *FeeService) CollectFee(order *models.Order, isMaker bool, db *gorm.DB) error {
	fee := fs.CalculateFee(order, isMaker)

	// Update user balance
	var user models.User
	if err := db.First(&user, order.UserID).Error; err != nil {
		return err
	}

	// Deduct fee from user's balance
	user.Balance -= fee

	// Save updated balance
	if err := db.Save(&user).Error; err != nil {
		return err
	}

	// Record fee transaction
	feeTransaction := models.FeeTransaction{
		UserID:    order.UserID,
		OrderID:   order.ID,
		Amount:    fee,
		Currency:  order.Pair,
		CreatedAt: time.Now(),
	}

	return db.Create(&feeTransaction).Error
}
