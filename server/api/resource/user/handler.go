package user

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

type User struct {
	ID        int                    `json:"id"`
	FirstName string                 `json:"first_name"`
	LastName  string                 `json:"last_name"`
	Email     string                 `json:"email"`
	Role      string                 `json:"role"`
	CreatedAt time.Time              `json:"created_at"`
	Flags     map[string]interface{} `json:"flags,omitempty"`
}

type Handler struct {
	DB *database.DB
}

func New() *Handler {
	return &Handler{}
}

func (h *Handler) GetUsers(c *gin.Context) {
	rows, err := h.DB.Pool().Query(context.Background(), "SELECT * FROM users ORDER BY id ASC")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Query failed"})
		return
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
		if err != nil {
			fmt.Printf("error scanning user: %v", err)
			return
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "Error occurred during iteration: %v\n", err)
		c.JSON(500, gin.H{"error": "Error occurred during iteration"})
		return
	}

	c.JSON(200, users)
}

func (h *Handler) GetUserByID(c *gin.Context) {
	var user User
	id := c.Param("id")
	err := h.DB.Pool().QueryRow(context.Background(), "SELECT * FROM users WHERE id = $1", id).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error getting user: %v\n", err)
		c.JSON(500, gin.H{"error": "error getting user"})
		return
	}
	c.JSON(200, user)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var user User
	err := c.BindJSON(&user)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error binding json: %v\n", err)
		c.JSON(400, gin.H{"error": "error binding json"})
		return
	}
	currentTime := time.Now()
	err = h.DB.Pool().QueryRow(context.Background(), "INSERT INTO users (first_name, last_name, email, role, flags, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", user.FirstName, user.LastName, user.Email, user.Role, user.Flags, currentTime).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error inserting user: %v\n", err)
		c.JSON(500, gin.H{"error": "error inserting user"})
		return
	}

	c.JSON(200, user)
}

func (h *Handler) UpdateUser(c *gin.Context) {
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
	for k, v := range user {
		query += fmt.Sprintf("%s = $%d, ", k, i)
		args = append(args, v)
		i++
	}

	query = strings.TrimSuffix(query, ", ")
	query += " WHERE id = $1" + strconv.Itoa(i)
	args = append(args, id)

	_, err := h.DB.Pool().Exec(context.Background(), query, args...)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Update failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}

	c.JSON(200, gin.H{"message": "User updated successfully"})

}

func (h *Handler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "id is required"})
		return
	}

	_, err := h.DB.Pool().Exec(context.Background(), "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Delete failed: %v\n", err)
		c.JSON(500, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(200, gin.H{"status": "User deleted successfully"})
}
