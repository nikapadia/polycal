package api

import (
	"os"
	"server/api/resource/event"
	"server/api/resource/user"
	"server/database"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

func SetupRouter(db *database.DB) *gin.Engine {
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	gothic.Store = sessions.NewCookieStore([]byte("a-state-of-entropy"))

	goth.UseProviders(
		google.New(os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"), "http://localhost:8080/auth/google/callback"),
	)

	userHandler := user.Handler{DB: db}
	eventHandler := event.Handler{DB: db}

	r.GET("/users", userHandler.GetUsers)
	r.GET("/users/:id", userHandler.GetUserByID)
	r.POST("/users", userHandler.CreateUser)
	r.PATCH("/users/:id", userHandler.UpdateUser)
	r.DELETE("/users/:id", userHandler.DeleteUser)

	r.GET("/events", eventHandler.GetEvents)
	r.GET("/events/:id", eventHandler.GetEventByID)
	r.POST("/events", eventHandler.CreateEvent)
	r.PATCH("/events/:id", eventHandler.UpdateEvent)
	r.DELETE("/events/:id", eventHandler.DeleteEvent)

	r.GET("/auth/google/callback", getAuthCallback)
	r.GET("/auth/google", beginAuthHandler)

	return r

}

func beginAuthHandler(c *gin.Context) {
	provider := c.GetHeader("X-Provider")
	if provider == "" {
		c.String(400, "Provider not specified")
		return
	}

	// You can add validation to ensure the provider is valid if needed
	// For now, assuming it's always 'google'

	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func getAuthCallback(c *gin.Context) {
	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		// Handle error
		c.String(500, "Error: %v", err)
		return
	}
	// Handle successful authentication
	c.String(200, "Logged in as "+user.Name)
}
