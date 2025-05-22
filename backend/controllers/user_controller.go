package controllers

import (
	"encoding/json"
	"net/http"

	"exchange/middleware"
	"exchange/models"
	"exchange/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserController struct {
	Database *gorm.DB
}

func NewUserController(db *gorm.DB) *UserController {
	return &UserController{Database: db}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags User
// @Accept json
// @Produce json
// @Param user body models.User true "User registration data"
// @Success 201 {object} utils.Response{data=models.User}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /register [post]
func (u *UserController) Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.ValidationErrorResponse(w, "Invalid request body")
		return
	}

	// Validate email and password
	if err := utils.ValidateEmail(user.Email); err != nil {
		utils.ValidationErrorResponse(w, err.Error())
		return
	}

	if err := utils.ValidatePassword(user.Password); err != nil {
		utils.ValidationErrorResponse(w, err.Error())
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}
	user.Password = string(hashedPassword)

	// Create user
	if err := u.Database.Create(&user).Error; err != nil {
		utils.ValidationErrorResponse(w, "Email already exists")
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}

	// Set auth cookie
	utils.SetAuthCookie(w, token)

	utils.SuccessResponse(w, "User registered successfully", user)
}

// Login godoc
// @Summary Login user
// @Description Login with email and password
// @Tags User
// @Accept json
// @Produce json
// @Param credentials body struct{Email string `json:"email"` Password string `json:"password"`} true "Login credentials"
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /login [post]
func (u *UserController) Login(w http.ResponseWriter, r *http.Request) {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		utils.ValidationErrorResponse(w, "Invalid request body")
		return
	}

	var user models.User
	if err := u.Database.Where("email = ?", loginData.Email).First(&user).Error; err != nil {
		utils.UnauthorizedResponse(w)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password)); err != nil {
		utils.UnauthorizedResponse(w)
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		utils.InternalServerErrorResponse(w)
		return
	}

	// Set auth cookie
	utils.SetAuthCookie(w, token)

	utils.SuccessResponse(w, "Login successful", user)
}

// Logout godoc
// @Summary Logout user
// @Description Clear authentication cookie
// @Tags User
// @Produce json
// @Success 200 {object} utils.Response
// @Router /logout [post]
func (u *UserController) Logout(w http.ResponseWriter, r *http.Request) {
	utils.ClearAuthCookie(w)
	utils.SuccessResponse(w, "Logged out successfully", nil)
}

// GetUser godoc
// @Summary Get user profile
// @Description Get current user's profile information
// @Tags User
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=models.User}
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Router /user [get]
func (u *UserController) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		utils.UnauthorizedResponse(w)
		return
	}

	var user models.User
	if err := u.Database.First(&user, "id = ?", userID).Error; err != nil {
		utils.NotFoundResponse(w, "User not found")
		return
	}

	utils.SuccessResponse(w, "User retrieved successfully", user)
}
