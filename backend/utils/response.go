package utils

import (
	"encoding/json"
	"net/http"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// setCORSHeaders sets the CORS headers for the response
func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
}

// JSONResponse sends a JSON response with the given status code and data
func JSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	setCORSHeaders(w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// SuccessResponse sends a success response
func SuccessResponse(w http.ResponseWriter, message string, data interface{}) {
	JSONResponse(w, http.StatusOK, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse sends an error response
func ErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	JSONResponse(w, statusCode, Response{
		Success: false,
		Error:   message,
	})
}

// ValidationErrorResponse sends a validation error response
func ValidationErrorResponse(w http.ResponseWriter, message string) {
	ErrorResponse(w, http.StatusBadRequest, message)
}

// NotFoundResponse sends a not found response
func NotFoundResponse(w http.ResponseWriter, message string) {
	ErrorResponse(w, http.StatusNotFound, message)
}

// UnauthorizedResponse sends an unauthorized response
func UnauthorizedResponse(w http.ResponseWriter) {
	ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
}

// InternalServerErrorResponse sends an internal server error response
func InternalServerErrorResponse(w http.ResponseWriter) {
	ErrorResponse(w, http.StatusInternalServerError, "Internal server error")
}
