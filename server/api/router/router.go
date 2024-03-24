package router

import (
	"net/http"
	"server/api/resource/user"
	"server/database"
	"strconv"

	"server/api/resource/user"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// func setupRouter(db *database.DB) *gin.Engine {
// 	r := gin.Default()
// 	r.ForwardedByClientIP = true
// 	r.SetTrustedProxies([]string{"127.0.0.1"})

// 	r.Use(func(c *gin.Context) {
// 		c.Set("db", db)
// 		c.Next()
// 	})

// 	userHandler := user.Handler{}
// 	r.GET("/users", func(c *gin.Context) {
// 		users, err := userHandler.GetUsers()
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
// 		c.JSON(http.StatusOK, users)
// 	})
// 	r.GET("/users/:id", func(c *gin.Context) {
// 		idStr := c.Param("id")
// 		if idStr == "" {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
// 			return
// 		}
// 		id, err := strconv.Atoi(idStr)
// 		user, err := userHandler.GetUserByID(id)
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
// 		c.JSON(http.StatusOK, user)
// 	})
// 	return r
// }

func addUserRoutes(rg *gin.RouterGroup) {
	userAPI := user.New()
	rg.GET("/users", userAPI.GetUsers)
	// rg.GET("/users/:id", getUserByID)
	// rg.POST("/users", createUser)
	// rg.PATCH("/users/:id", updateUser)
	// rg.DELETE("/users/:id", deleteUser)
}

func New(db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	v1 := r.Group("/api/v1")
	addUserRoutes(v1)

	return r
}
