package api

import (
	"server/api/resource/event"
	"server/api/resource/user"
	"server/database"

	"github.com/gin-gonic/gin"
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

	return r

}
