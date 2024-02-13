package main

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"server/database"
	"server/model"

	"github.com/gin-gonic/gin"
)

type Event = model.Event
type User = model.User

/* GET REQUEST HANDLERS */

// get all users
func getUsers(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	rows, err := db.Pool().Query(context.Background(), "SELECT * FROM users ORDER BY id ASC")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var user User
		err = rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Scan failed: %v\n", err)
			os.Exit(1)
		}
		users = append(users, user)

	}

	if err := rows.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "Error occurred during iteration: %v\n", err)
		os.Exit(1)
	}

	c.JSON(200, users)
}

// get user by id
func getUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	id := c.Param("id")
	var user User
	err := db.Pool().QueryRow(context.Background(), "SELECT id, first_name, last_name, email, role, created_at, flags FROM users WHERE id = $1", id).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(404, gin.H{"error": "User not found"})
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

	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Pool().Exec(context.Background(), "INSERT INTO users (first_name, last_name, email, role, flags) VALUES ($1, $2, $3, $4, $5)", user.FirstName, user.LastName, user.Email, user.Role, user.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to insert user: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to insert user"})
		return
	}

	c.JSON(200, user)
}

/* PUT REQUEST HANDLERS */
func putEvent(c *gin.Context) {
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

	_, err := db.Pool().Exec(context.Background(), "UPDATE events SET title = $1, description = $2, start_date = $3, end_date = $4, location = $5, status = $6, flags = $7 WHERE id = $8", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags, event.ID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to update event: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to update event"})
		return
	}

	c.JSON(200, event)
}

func putUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*database.DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Pool().Exec(context.Background(), "UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, flags = $5 WHERE id = $6", user.FirstName, user.LastName, user.Email, user.Role, user.Flags, user.ID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to update user: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to update user"})
		return
	}

	c.JSON(200, user)
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

	var user map[string]interface{}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}

	query := "UPDATE users SET "
	args := []interface{}{}
	i := 1

	for key, value := range user {
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

	c.JSON(200, gin.H{"status": "User updated successfully"})
}

/* DELETE REQUEST HANDLERS */
func deleteEvent(c *gin.Context) {
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

	_, err := db.Pool().Exec(context.Background(), "DELETE FROM events WHERE id = $1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Delete failed: %v\n", err)
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

/* func NewDB() (*DB, error) {
	err := godotenv.Load(".env")
	pool, err := pgxpool.New(context.Background(), os.Getenv("POSTGRES_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		return nil, err
	}
	return &DB{pool: pool}, nil
}

func (db *DB) Close() {
	db.pool.Close()
} */

func setupRouter(db *database.DB) *gin.Engine {
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	r.GET("/users", getUsers)
	r.GET("/users/:id", getUser)
	r.GET("/events", getEvents)
	r.GET("/events/:id", getEvent)

	r.POST("/events", postEvent)
	r.POST("/users", postUser)

	// r.PUT("/events/:id", putEvent)
	// r.PUT("/users/:id", putUser)

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
