package user

import (
	"context"
	"fmt"
	"server/database"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	DB *database.DB
}

func (h *Handler) GetUsers() ([]User, error) {
	rows, err := h.DB.Pool().Query(context.Background(), "SELECT * FROM users ORDER BY id ASC")
	if err != nil {
		return nil, fmt.Errorf("error getting users: %w", err)
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
		if err != nil {
			return nil, fmt.Errorf("error scanning user: %w", err)
		}
		users = append(users, user)
	}
	return users, nil
}

func (h *Handler) GetUserByID(id int) (*User, error) {
	var user User
	err := h.DB.Pool().QueryRow(context.Background(), "SELECT * FROM users WHERE id = $1", id).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		return nil, fmt.Errorf("error getting user: %w", err)
	}
	return &user, nil
}

func (h *Handler) CreateUser(user User) (*User, error) {
	currentTime := time.Now()
	err := h.DB.Pool().QueryRow(context.Background(), "INSERT INTO users (first_name, last_name, email, role, flags, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", user.FirstName, user.LastName, user.Email, user.Role, user.Flags, currentTime).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		return nil, fmt.Errorf("error creating user: %w", err)
	}
	return &user, nil
}

func (h *Handler) UpdateUser(id int, updatedFields map[string]interface{}) (*User, error) {
	var user User

	query := "UPDATE users SET "
	var args []interface{}
	i := 1

	for k, v := range updatedFields {
		query += fmt.Sprintf("%s = $%d, ", k, i)
		args = append(args, v)
		i++
	}

	query = strings.TrimSuffix(query, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", i)
	args = append(args, id)

	query += " RETURNING *"

	row := h.DB.Pool().QueryRow(context.Background(), query, args...)
	err := row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.CreatedAt, &user.Flags)
	if err != nil {
		return nil, fmt.Errorf("error scanning user: %w", err)
	}

	return &user, nil
}

func (h *Handler) DeleteUser(id int) error {
	_, err := h.DB.Pool().Exec(context.Background(), "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("error deleting user: %w", err)
	}
	return nil
}
