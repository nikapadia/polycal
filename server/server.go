package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
)

var db = make(map[string]string)

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	// lmt := tollbooth.NewLimiter(1, nil)

	// Ping test
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Get user value
	r.GET("/user/:name", func(c *gin.Context) {
		user := c.Params.ByName("name")
		value, ok := db[user]
		if ok {
			c.JSON(http.StatusOK, gin.H{"user": user, "value": value})
		} else {
			c.JSON(http.StatusOK, gin.H{"user": user, "status": "no value"})
		}
	})

	// Get all users
	r.GET("/users", getUsers)

	// Get all events
	r.GET("/events", getEvents)

	// Authorized group (uses gin.BasicAuth() middleware)
	// Same than:
	// authorized := r.Group("/")
	// authorized.Use(gin.BasicAuth(gin.Credentials{
	//	  "foo":  "bar",
	//	  "manu": "123",
	//}))
	authorized := r.Group("/", gin.BasicAuth(gin.Accounts{
		"foo":  "bar", // user:foo password:bar
		"manu": "123", // user:manu password:123
	}))

	/* example curl for /admin with basicauth header
	   Zm9vOmJhcg== is base64("foo:bar")

		curl -X POST \
	  	http://localhost:8080/admin \
	  	-H 'authorization: Basic Zm9vOmJhcg==' \
	  	-H 'content-type: application/json' \
	  	-d '{"value":"bar"}'
	*/
	authorized.POST("admin", func(c *gin.Context) {
		user := c.MustGet(gin.AuthUserKey).(string)

		// Parse JSON
		var json struct {
			Value string `json:"value" binding:"required"`
		}

		if c.Bind(&json) == nil {
			db[user] = json.Value
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		}
	})

	return r
}

func getUsers(c *gin.Context) {
	// load users from tmp_data file
	var users = make(map[string]string)
	file, err := os.ReadFile("tmp_data/users.json")
	if err != nil {
		fmt.Println(err)
	}
	var json = jsoniter.ConfigCompatibleWithStandardLibrary
	json.Unmarshal(file, &users)
	c.JSON(200, gin.H{users["users"]: users})
}

func getEvents(c *gin.Context) {
	// load events from tmp_data file
	var events []map[string]interface{}
	file, err := os.ReadFile("./tmp_data/events.json")
	if err != nil {
		fmt.Println(err)
	}
	start_date := c.Query("start_date")
	end_date := c.Query("end_date")
	var json = jsoniter.ConfigCompatibleWithStandardLibrary
	err = json.Unmarshal(file, &events)
	if err != nil {
		fmt.Println(err)
	}
	// filter events by start_date and end_date
	if start_date != "" && end_date != "" {
		var filteredEvents []map[string]interface{}
		for _, event := range events {
			if event["start_date"].(string) >= start_date && event["end_date"].(string) <= end_date {
				filteredEvents = append(filteredEvents, event)
			}
		}
		events = filteredEvents
	}
	c.JSON(200, events)
}

func connectDB() {
	// connect to DB
}

func main() {
	r := setupRouter()
	// Listen and Server in 0.0.0.0:8080
	r.Run(":8080")
}
