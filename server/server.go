package main

import (
	"context"
	"fmt"
	"os"
	"reflect"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type DB struct {
	pool *pgxpool.Pool
}

type Event struct {
	ID          int                    `json:"id"`
	UserID      int                    `json:"user_id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	StartDate   time.Time              `json:"start_date"`
	EndDate     time.Time              `json:"end_date"`
	Location    string                 `json:"location"`
	Status      string                 `json:"status"`
	Flags       map[string]interface{} `json:"flags"`
}

type User struct {
	ID        int                    `json:"id"`
	FirstName string                 `json:"first_name"`
	LastName  string                 `json:"last_name"`
	Email     string                 `json:"email"`
	Role      string                 `json:"role"`
	CreatedAt time.Time              `json:"created_at"`
	Flags     map[string]interface{} `json:"flags"`
}

func setupRouter(db *DB) *gin.Engine {
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

	r.PATCH("/events/:id", patchEvent)
	return r
}

/* GET REQUEST HANDLERS */
func getUsers(c *gin.Context) {
	// get users from database
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}
	var rows pgx.Rows
	var err error
	rows, err = db.pool.Query(context.Background(), "SELECT id, first_name, last_name, email, role, created_at, flags FROM users ORDER BY id ASC")
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

func getUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	id := c.Param("id")
	var user User
	err := db.pool.QueryRow(context.Background(), "SELECT id, first_name, last_name, email, role, created_at, flags FROM users WHERE id = $1", id).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	c.JSON(200, user)
}

func getEvents(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
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

	rows, err := db.pool.Query(context.Background(), query, args...)

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

func getEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	id := c.Param("id")
	var event Event
	err := db.pool.QueryRow(context.Background(), "SELECT id, title, description, start_date, end_date, location, status, flags FROM events WHERE id = $1", id).Scan(&event.ID, &event.Title, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &event.Status, &event.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
	}

	c.JSON(200, event)
}

/* POST REQUEST HANDLERS */

func postEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.pool.Exec(context.Background(), "INSERT INTO events (title, description, start_date, end_date, location, status, flags) VALUES ($1, $2, $3, $4, $5, $6, $7)", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to insert event: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to insert event"})
		return
	}

	c.JSON(200, event)
}

/* PUT REQUEST HANDLERS */
func putEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.pool.Exec(context.Background(), "UPDATE events SET title = $1, description = $2, start_date = $3, end_date = $4, location = $5, status = $6, flags = $7 WHERE id = $8", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags, event.ID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to update event: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to update event"})
		return
	}

	c.JSON(200, event)
}

func putUser(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.pool.Exec(context.Background(), "UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, flags = $5 WHERE id = $6", user.FirstName, user.LastName, user.Email, user.Role, user.Flags, user.ID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to update user: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to update user"})
		return
	}

	c.JSON(200, user)
}

/* PATCH REQUEST HANDLERS */
func patchEvent(c *gin.Context) {
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Create a slice to hold the query parameters
	params := []interface{}{}

	// Create a slice to hold the SET clauses
	setClauses := []string{}

	// Use reflection to iterate over the fields of the event struct
	v := reflect.ValueOf(event)
	typeOfEvent := v.Type()

	for i := 0; i < v.NumField(); i++ {
		// Skip the ID field
		if typeOfEvent.Field(i).Name == "ID" {
			continue
		}

		// Add the field to the query and params if it's not the zero value for its type
		if v.Field(i).Interface() != reflect.Zero(v.Field(i).Type()).Interface() {
			setClauses = append(setClauses, fmt.Sprintf("%s = $%d", strings.ToLower(typeOfEvent.Field(i).Name), len(params)+1))
			params = append(params, v.Field(i).Interface())
		}
	}
	fmt.Println("hello world")

	// Add the event ID to the params
	params = append(params, event.ID)

	// Build the query
	query := fmt.Sprintf("UPDATE events SET %s WHERE id = $%d", strings.Join(setClauses, ", "), len(params))

	// Execute the query
	_, err := db.pool.Exec(context.Background(), query, params...)

	// _, err := db.pool.Exec(context.Background(), "UPDATE events SET title = $1, description = $2, start_date = $3, end_date = $4, location = $5, status = $6, flags = $7 WHERE id = $8", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags, event.ID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to update event: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to update event"})
		return
	}

	c.JSON(200, event)
}

func NewDB() (*DB, error) {
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
}

func main() {
	db, err := NewDB()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	r := setupRouter(db)

	// Listen and Server in 0.0.0.0:8080
	r.Run(":8080")
}
