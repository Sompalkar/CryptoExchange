package routes

import (
	"exchange/controllers"

	"github.com/gorilla/mux"
)

func UserRoutes(router *mux.Router, userController *controllers.UserController) {
	router.HandleFunc("/api/users/register", userController.Register).Methods("POST")
	router.HandleFunc("/api/users/login", userController.Login).Methods("POST")
	router.HandleFunc("/api/users/me", userController.GetUser).Methods("GET")
}
