 

// User authentication and management functions
func (u *User) Register(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Validate user input
    if user.Email == "" || user.Password == "" {
        http.Error(w, "Email and password are required", http.StatusBadRequest)
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error processing password", http.StatusInternalServerError)
        return
    }
    user.Password = string(hashedPassword)

    // Save user to database
    if err := db.Create(&user).Error; err != nil {
        http.Error(w, "Error creating user", http.StatusInternalServerError)
        return
    }

    // Generate JWT token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "email":   user.Email,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    })

    tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "token": tokenString,
    })
}

func (u *User) Login(w http.ResponseWriter, r *http.Request) {
    var credentials struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    var user User
    if err := db.Where("email = ?", credentials.Email).First(&user).Error; err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "email":   user.Email,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    })

    tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "token": tokenString,
    })
}

func (u *User) GetProfile(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uint)
    
    var user User
    if err := db.First(&user, userID).Error; err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    // Remove sensitive information
    user.Password = ""
    json.NewEncoder(w).Encode(user)
}

func (u *User) UpdateProfile(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uint)
    
    var updateData struct {
        Name     string `json:"name"`
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    var user User
    if err := db.First(&user, userID).Error; err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    if updateData.Name != "" {
        user.Name = updateData.Name
    }
    if updateData.Email != "" {
        user.Email = updateData.Email
    }
    if updateData.Password != "" {
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updateData.Password), bcrypt.DefaultCost)
        if err != nil {
            http.Error(w, "Error processing password", http.StatusInternalServerError)
            return
        }
        user.Password = string(hashedPassword)
    }

    if err := db.Save(&user).Error; err != nil {
        http.Error(w, "Error updating profile", http.StatusInternalServerError)
        return
    }

    user.Password = ""
    json.NewEncoder(w).Encode(user)
}

func (u *User) DeleteAccount(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uint)
    
    if err := db.Delete(&User{}, userID).Error; err != nil {
        http.Error(w, "Error deleting account", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}

// Trading related functions
func (u *User) GetPortfolio(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uint)
    
    var portfolio []Portfolio
    if err := db.Where("user_id = ?", userID).Find(&portfolio).Error; err != nil {
        http.Error(w, "Error fetching portfolio", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(portfolio)
}

func (u *User) PlaceOrder(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uint)
    
    var order Order
    if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    order.UserID = userID
    order.Status = "pending"

    if err := db.Create(&order).Error; err != nil {
        http.Error(w, "Error placing order", http.StatusInternalServerError)
        return
    }

    // Process order in trading engine
    go processOrder(order)

    json.NewEncoder(w).Encode(order)
}

func (u *User) GetOrderHistory(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uint)
    
    var orders []Order
    if err := db.Where("user_id = ?", userID).Find(&orders).Error; err != nil {
        http.Error(w, "Error fetching order history", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(orders)
}

func (u *User) GetMarketData(w http.ResponseWriter, r *http.Request) {
    symbol := r.URL.Query().Get("symbol")
    if symbol == "" {
        http.Error(w, "Symbol is required", http.StatusBadRequest)
        return
    }

    // Fetch market data from external API or database
    marketData, err := fetchMarketData(symbol)
    if err != nil {
        http.Error(w, "Error fetching market data", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(marketData)
}

// Helper functions
func processOrder(order Order) {
    // Implement order processing logic
    // This could include:
    // 1. Validation
    // 2. Price checking
    // 3. Execution
    // 4. Settlement
    // 5. Portfolio update
}

func fetchMarketData(symbol string) (interface{}, error) {
    // Implement market data fetching logic
    // This could include:
    // 1. Real-time price data
    // 2. Order book
    // 3. Recent trades
    // 4. Market statistics
    return nil, nil
}

}
 