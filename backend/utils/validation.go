package utils

import (
	"errors"
	"regexp"
	"strings"
)

var (
	ErrInvalidEmail    = errors.New("invalid email format")
	ErrInvalidPassword = errors.New("password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number")
	ErrInvalidAmount   = errors.New("amount must be greater than 0")
	ErrInvalidPrice    = errors.New("price must be greater than 0")
)

// ValidateEmail checks if the email is valid
func ValidateEmail(email string) error {
	email = strings.TrimSpace(email)
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return ErrInvalidEmail
	}
	return nil
}

// ValidatePassword checks if the password meets the requirements
func ValidatePassword(password string) error {
	if len(password) < 8 {
		return ErrInvalidPassword
	}

	hasUpper := false
	hasLower := false
	hasNumber := false

	for _, char := range password {
		switch {
		case 'A' <= char && char <= 'Z':
			hasUpper = true
		case 'a' <= char && char <= 'z':
			hasLower = true
		case '0' <= char && char <= '9':
			hasNumber = true
		}
	}

	if !hasUpper || !hasLower || !hasNumber {
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
