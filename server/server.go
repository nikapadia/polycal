package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	jsoniter "github.com/json-iterator/go"
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

func setupRouter(db *DB) *gin.Engine {
	r := gin.Default()
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Get all users
	r.GET("/users", getUsers)

	// Get all events
	r.GET("/events", getEvents)

	r.POST("/events", addEvent)

	return r
}

func getUsers(c *gin.Context) {
	// TODO: Read users from the db instead of a file
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
		query += " WHERE start_date >= $1 AND end_date <= $2 AND status = $3 ORDER BY id ASC"
		args = append(args, start_date, end_date, status)
	} else if start_date != "" && end_date != "" {
		query += " WHERE start_date >= $1 AND end_date <= $2 ORDER BY id ASC"
		args = append(args, start_date, end_date)
	} else if status != "" {
		query += " WHERE status = $1 ORDER BY id ASC"
		args = append(args, status)
	} else {
		query += " ORDER BY id ASC"
	}

	query += " LIMIT 100" // Temporary limit

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

func addEvent(c *gin.Context) {
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

	_, err := db.pool.Exec(context.Background(), "INSERT INTO events (title, description, start_date, end_date, location, status, flags, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags, event.UserID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Insert failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Insert failed"})
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
