package utils

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

var (
	ErrInvalidEmail    = errors.New("invalid email format")
	ErrInvalidPassword = errors.New("password must be at least 8 characters long")
	ErrInvalidAmount   = errors.New("amount must be greater than 0")
	ErrInvalidPrice    = errors.New("price must be greater than 0")
)

// ValidateEmail checks if the email is valid
func ValidateEmail(email string) error {
	email = strings.TrimSpace(email)
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return ErrInvalidEmail
	}
	return nil
}

// ValidatePassword checks if the password meets the minimum length requirement
func ValidatePassword(password string) error {

	fmt.Println(password)
	if len(password) < 8 {
		return ErrInvalidPassword
	}
	return nil
}

// ValidateAmount checks if the amount is valid
func ValidateAmount(amount float64) error {
	if amount <= 0 {
		return ErrInvalidAmount
	}
	return nil
}

// ValidatePrice checks if the price is valid
func ValidatePrice(price float64) error {
	if price <= 0 {
		return ErrInvalidPrice
	}
	return nil
}

// ValidateOrderInput validates order input
func ValidateOrderInput(amount, price float64) error {
	if err := ValidateAmount(amount); err != nil {
		return err
	}
	if err := ValidatePrice(price); err != nil {
		return err
	}
	return nil
}
