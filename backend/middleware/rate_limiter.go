package middleware

import (
	"net/http"
	"sync"
	"time"
)

// RateLimiter implements rate limiting
type RateLimiter struct {
	requests map[string][]time.Time
	mu       sync.Mutex
	limit    int
	window   time.Duration
}

// NewRateLimiter creates a new RateLimiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// RateLimit middleware function
func (rl *RateLimiter) RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get client IP
		clientIP := r.RemoteAddr

		rl.mu.Lock()
		defer rl.mu.Unlock()

		// Clean old requests
		now := time.Now()
		validRequests := make([]time.Time, 0)
		for _, t := range rl.requests[clientIP] {
			if now.Sub(t) <= rl.window {
				validRequests = append(validRequests, t)
			}
		}
		rl.requests[clientIP] = validRequests

		// Check if rate limit exceeded
		if len(validRequests) >= rl.limit {
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		// Add current request
		rl.requests[clientIP] = append(rl.requests[clientIP], now)

		// Call next handler
		next.ServeHTTP(w, r)
	})
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Limit  int
	Window time.Duration
}

// DefaultRateLimitConfig returns default rate limiting configuration
func DefaultRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		Limit:  100,             // 100 requests
		Window: 1 * time.Minute, // per minute
	}
}
