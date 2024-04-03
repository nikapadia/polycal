package api

import (
	"fmt"
	"os"
	"server/api/resource/event"
	"server/api/resource/user"
	"server/database"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
)

func SetupRouter(db *database.DB) *gin.Engine {
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

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
	// provider := c.Param("provider")
	c.JSON(200, gin.H{"message": "beginAuthHandler"})
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func getAuthCallback(c *gin.Context) {
	// provider := c.Param("provider")

	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return
	}

	fmt.Println(user)

	// redirect to localhost
	c.Redirect(200, "http://localhost:5173")
}
