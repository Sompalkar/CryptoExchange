package main

import (
	"fmt"
	"log"
	"net/http"
)



func main(){

	 

  r := mux.NewRouter()











     



	log.Fatal( http.ListenAndServe(":8000", nil));
	fmt.Println("Server is running on port 8000")

}