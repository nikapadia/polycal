package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	"server/api/resource/user"
	"server/database"
	"server/model"

	"github.com/gin-gonic/gin"
)

type Event = model.Event
type User = user.User

/* GET REQUEST HANDLERS */

// get all users
func getUsers(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	handler := user.Handler{DB: db}
	users, err := handler.GetUsers()
	if err != nil {
		c.JSON(500, gin.H{"error": "Unable to get users"})
		return
	}

	c.JSON(200, users)
}

// get user by id
func getUserByID(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	handler := user.Handler{DB: db}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid user id"})
		return
	}
	user, err := handler.GetUserByID(id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Unable to get user"})
		return
	}

	c.JSON(200, user)
}

// get all events
func getEvents(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	start_date := c.Query("start_date")
	end_date := c.Query("end_date")
	status := c.Query("status")

	query := "SELECT id, title, description, start_date, end_date, location, status, flags FROM events"
	args := []interface{}{}

	if start_date != "" && end_date != "" && status != "" {
		query += " WHERE start_date BETWEEN $1 AND $2 AND status = $3 ORDER BY id ASC"
		args = append(args, start_date, end_date, status)
	} else if start_date != "" && end_date != "" {
		query += " WHERE start_date BETWEEN $1 AND $2 ORDER BY id ASC"
		args = append(args, start_date, end_date)
	} else if status != "" {
		query += " WHERE status = $1 ORDER BY id ASC"
		args = append(args, status)
	} else {
		query += " ORDER BY id ASC"
	}

	// query += " LIMIT 100" // Temporary limit

	rows, err := db.Pool().Query(context.Background(), query, args...)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
		return
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var event Event
		err = rows.Scan(&event.ID, &event.Title, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &event.Status, &event.Flags)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Scan failed: %v\n", err)
			c.JSON(500, gin.H{"error": "Scan failed"})
			return
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "Error occurred during iteration: %v\n", err)
		c.JSON(500, gin.H{"error": "Error occurred during iteration"})
		return
	}

	c.JSON(200, events)
}

// get event by id
func getEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	id := c.Param("id")
	var event Event
	err := db.Pool().QueryRow(context.Background(), "SELECT id, title, description, start_date, end_date, location, status, flags FROM events WHERE id = $1", id).Scan(&event.ID, &event.Title, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &event.Status, &event.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
	}

	c.JSON(200, event)
}

/* POST REQUEST HANDLERS */

// create new event
func postEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Pool().Exec(context.Background(), "INSERT INTO events (title, description, start_date, end_date, location, status, flags) VALUES ($1, $2, $3, $4, $5, $6, $7)", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to insert event: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to insert event"})
		return
	}

	c.JSON(200, event)
}

func postUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	// take the user from the request body
	var body User
	err := json.NewDecoder(c.Request.Body).Decode(&body)
	if err != nil {
		if err.Error() == "invalid character '-' in numeric literal" {
			c.JSON(400, gin.H{"error": "Invalid JSON: incorrectly formatted number"})
		} else {
			c.JSON(400, gin.H{"error": err.Error()})
		}
		return
	}

	handler := user.Handler{DB: db}
	newUser, err := handler.CreateUser(body)
	if err != nil {
		c.JSON(500, gin.H{"error": "Unable to create user", "details": err.Error()})
		return
	}

	c.JSON(200, newUser)
}

/* PATCH REQUEST HANDLERS */
func patchEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var event map[string]interface{}
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}

	query := "UPDATE events SET "
	args := []interface{}{}
	i := 1

	for key, value := range event {
		query += fmt.Sprintf("%s=$%d, ", key, i)
		args = append(args, value)
		i++
	}

	query = strings.TrimSuffix(query, ", ")
	query += " WHERE id=$" + strconv.Itoa(i)
	args = append(args, id)

	_, err := db.Pool().Exec(context.Background(), query, args...)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Update failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}

	c.JSON(200, gin.H{"status": "Event updated successfully"})

}

func patchUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	handler := user.Handler{DB: db}
	var body map[string]interface{}
	err := json.NewDecoder(c.Request.Body).Decode(&body)
	if err != nil {
		if err.Error() == "invalid character '-' in numeric literal" {
			c.JSON(400, gin.H{"error": "Invalid JSON: incorrectly formatted number"})
		} else {
			c.JSON(400, gin.H{"error": err.Error()})
		}
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}
	parsedID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	updatedUser, err := handler.UpdateUser(parsedID, body)
	if err != nil {
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}

	c.JSON(200, updatedUser)

	c.JSON(200, gin.H{"status": "User updated successfully"})
}

/* DELETE REQUEST HANDLERS */
func deleteEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	handler := user.Handler{DB: db}

	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Improper id format"})
		return
	}

	err = handler.DeleteUser(id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(200, gin.H{"status": "Event deleted successfully"})
}

func deleteUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}

	_, err := db.Pool().Exec(context.Background(), "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Delete failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(200, gin.H{"status": "User deleted successfully"})
}

func setupRouter(db *database.DB) *gin.Engine {
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	r.GET("/users", getUsers)
	r.GET("/users/:id", getUserByID)
	r.GET("/events", getEvents)
	r.GET("/events/:id", getEvent)

	r.POST("/events", postEvent)
	r.POST("/users", postUser)

	r.PATCH("/events/:id", patchEvent)
	r.PATCH("/users/:id", patchUser)

	r.DELETE("/events/:id", deleteEvent)
	r.DELETE("/users/:id", deleteUser)
	return r
}

func main() {
	db, err := database.NewDB()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	r := setupRouter(db)

	r.Run(":8080")
}
