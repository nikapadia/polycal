package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	jsoniter "github.com/json-iterator/go"
)

type DB struct {
	pool *pgxpool.Pool
}

type Event struct {
	ID          int                    `json:"id"`
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
	db, exists := c.MustGet("db").(*DB)
	if !exists {
		c.JSON(500, gin.H{"error": "db not found"})
		return
	}

	start_date := c.Query("start_date")
	end_date := c.Query("end_date")
	status := c.Query("status")

	var rows pgx.Rows
	var err error

	if status == "" && start_date != "" && end_date != "" {
		rows, err = db.pool.Query(context.Background(), "SELECT id, title, description, start_date, end_date, location, status, flags FROM events WHERE start_date >= $1 and end_date <= $2 ORDER BY id ASC", start_date, end_date)
	} else if status != "" && start_date != "" && end_date != "" {
		rows, err = db.pool.Query(context.Background(), "SELECT id, title, description, start_date, end_date, location, status, flags FROM events where start_date >= $1 and end_date <= $2 and status = $3 ORDER BY id ASC", start_date, end_date, status)
	} else if status != "" {
		rows, err = db.pool.Query(context.Background(), "SELECT id, title, description, start_date, end_date, location, status, flags FROM events where status = $1 ORDER BY id ASC", status)
	} else {
		rows, err = db.pool.Query(context.Background(), "SELECT id, title, description, start_date, end_date, location, status, flags FROM events ORDER BY id ASC")
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
	}

	defer rows.Close()

	var events []Event
	for rows.Next() {
		var event Event
		err = rows.Scan(&event.ID, &event.Title, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &event.Status, &event.Flags)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Scan failed: %v\n", err)
			os.Exit(1)
		}
		events = append(events, event)

	}

	if err := rows.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "Error occurred during iteration: %v\n", err)
		os.Exit(1)
	}

	c.JSON(200, events)
}

func NewDB() (*DB, error) {
	err := godotenv.Load(".env")
	pool, err := pgxpool.New(context.Background(), os.Getenv("POSTGRES_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		os.Exit(1)
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
