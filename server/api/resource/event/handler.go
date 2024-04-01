package event

import (
	"context"
	"fmt"
	"os"
	"server/database"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

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

type Handler struct {
	DB *database.DB
}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) GetEvents(c *gin.Context) {
	start_date := c.Query("start_date")
	end_date := c.Query("end_date")
	status := c.Query("status")
	limit := c.Query("limit")
	offset := c.Query("offset")

	query := "SELECT id, title, description, start_date, end_date, location, status, flags FROM events"
	var conditions []string
	var args []interface{}

	if start_date != "" && end_date != "" {
		conditions = append(conditions, "start_date BETWEEN $1 AND $2")
		args = append(args, start_date, end_date)
	}

	if status != "" {
		conditions = append(conditions, "status = $"+strconv.Itoa(len(args)+1))
		args = append(args, status)
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY id ASC"

	if limit != "" && offset != "" {
		query += " LIMIT " + limit + " OFFSET " + offset
	}

	// query += " LIMIT 100" // Temporary limit

	rows, err := h.DB.Pool().Query(context.Background(), query, args...)

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

func (h *Handler) GetEventByID(c *gin.Context) {
	var event Event
	id := c.Param("id")
	err := h.DB.Pool().QueryRow(context.Background(), "SELECT * FROM events WHERE id = $1", id).Scan(&event.ID, &event.Title, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &event.Status, &event.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
	}

	c.JSON(200, event)
}

func (h *Handler) CreateEvent(c *gin.Context) {
	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Pool().Exec(context.Background(), "INSERT INTO events (title, description, start_date, end_date, location, status, flags) VALUES ($1, $2, $3, $4, $5, $6, $7)", event.Title, event.Description, event.StartDate, event.EndDate, event.Location, event.Status, event.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to insert event: %v\n", err)
		c.JSON(500, gin.H{"error": "Unable to insert event"})
		return
	}

	c.JSON(200, event)
}

func (h *Handler) UpdateEvent(c *gin.Context) {
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

	_, err := h.DB.Pool().Exec(context.Background(), query, args...)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Update failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}

	c.JSON(200, gin.H{"status": "Event updated successfully"})
}

func (h *Handler) DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}

	_, err := h.DB.Pool().Exec(context.Background(), "DELETE FROM events WHERE id = $1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Delete failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(200, gin.H{"status": "Event deleted successfully"})
}
