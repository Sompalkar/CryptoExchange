package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"exchange/middleware"
	"exchange/models"
	"exchange/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserController handles user-related actions.
type UserController struct {
	DB *gorm.DB
}

// NewUserController returns a new UserController instance.
func NewUserController(db *gorm.DB) *UserController {
	return &UserController{DB: db}
}

// Register registers a new user.
// @Summary Register a new user
// @Tags User
// @Accept json
// @Produce json
// @Param user body models.User true "User registration"
// @Success 201 {object} utils.Response{data=models.User}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /register [post]

func (uc *UserController) Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.ValidationErrorResponse(w, "Invalid request body")
		return
	}

	// Capture raw password before any processing
	rawPassword := strings.TrimSpace(user.Password)

	// Validate email/password
	if err := utils.ValidateEmail(user.Email); err != nil {
		utils.ValidationErrorResponse(w, err.Error())
		return
	}

	// Check existing user
	var existing models.User
	if err := uc.DB.Where("email = ?", user.Email).First(&existing).Error; err == nil {
		utils.ValidationErrorResponse(w, "Email already registered")
		return
	}

	// Hash the RAW password (only once)
	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}

	// Debug logs to verify values
	fmt.Printf("Register - Raw Password: %s\n", rawPassword)  // Should show actual password
	fmt.Printf("Register - Hashed Password: %s\n", hashedPwd) // Should show bcrypt hash

	user.Password = string(hashedPwd)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	if err := uc.DB.Create(&user).Error; err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}

	utils.SetAuthCookie(w, token)
	user.Password = "" // Clear password before response
	utils.SuccessResponse(w, "User registered successfully", user)
}

// Login authenticates a user.
// @Summary Login user
// @Tags User
// @Accept json
// @Produce json
// @Param credentials body struct{Email string `json:"email"`; Password string `json:"password"`} true "Login credentials"
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /login [post]

func (uc *UserController) Login(w http.ResponseWriter, r *http.Request) {
	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		utils.ValidationErrorResponse(w, "Invalid request body")
		return
	}

	// Trim whitespace from inputs
	creds.Email = strings.TrimSpace(creds.Email)
	rawPassword := strings.TrimSpace(creds.Password)

	// Validate email format
	if err := utils.ValidateEmail(creds.Email); err != nil {
		utils.ValidationErrorResponse(w, err.Error())
		return
	}

	// Find user by email
	var user models.User
	if err := uc.DB.Where("email = ?", creds.Email).First(&user).Error; err != nil {
		utils.UnauthorizedResponse(w)
		return
	}

	// Debug logs for verification
	fmt.Printf("Login - Raw Password: %s\n", rawPassword)  // Should show user input
	fmt.Printf("Login - Stored Hash: %s\n", user.Password) // Should match registration hash

	// // Compare hashed password with RAW input
	if err := bcrypt.CompareHashAndPassword(
	    []byte(user.Password),
	    []byte(rawPassword),
	); err != nil {
	    utils.UnauthorizedResponse(w)
	    return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}

	utils.SetAuthCookie(w, token)
	user.Password = "" // Clear password before response
	utils.SuccessResponse(w, "Login successful", user)
}

// Logout logs the user out.
// @Summary Logout user
// @Tags User
// @Produce json
// @Success 200 {object} utils.Response
// @Router /logout [post]
func (uc *UserController) Logout(w http.ResponseWriter, r *http.Request) {
	utils.ClearAuthCookie(w)
	utils.SuccessResponse(w, "Logged out successfully", nil)
}

// GetUser returns the current user's profile.
// @Summary Get user profile
// @Tags User
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Router /user [get]
func (uc *UserController) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		utils.UnauthorizedResponse(w)
		return
	}

	var user models.User
	if err := uc.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.NotFoundResponse(w, "User not found")
		return
	}

	utils.SuccessResponse(w, "User retrieved successfully", user)
}
