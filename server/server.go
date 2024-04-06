package main

import (
	"fmt"
	"os"

	"server/api"
	"server/database"
)

func main() {
	db, err := database.NewDB()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	// auth.NewAuth()
	r := api.SetupRouter(db)

	r.Run(":8080")
}
