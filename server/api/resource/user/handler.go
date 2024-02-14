package user

import (
	"context"
	"fmt"
	"server/database"
	"time"
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

func (h *Handler) UpdateUser(id int, args map[string]interface{}) (*User, error) {
	user := User{}
	setters := map[string]func(*User, interface{}){
		"id": func(u *User, v interface{}) {
			if id, ok := v.(float64); ok {
				u.ID = int(id)
			}
		},
		"first_name": func(u *User, v interface{}) {
			if firstName, ok := v.(string); ok {
				u.FirstName = firstName
			}
		},
		"last_name": func(u *User, v interface{}) {
			if lastName, ok := v.(string); ok {
				u.LastName = lastName
			}
		},
		"email": func(u *User, v interface{}) {
			if email, ok := v.(string); ok {
				u.Email = email
			}
		},
		"role": func(u *User, v interface{}) {
			if role, ok := v.(string); ok {
				u.Role = role
			}
		},
		"flags": func(u *User, v interface{}) {
			if flags, ok := v.(map[string]interface{}); ok {
				u.Flags = flags
			}
		},
	}

	for key, value := range args {
		if setter, ok := setters[key]; ok {
			setter(&user, value)
		}
	}

	_, err := h.DB.Pool().Exec(context.Background(), "UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, flags = $5 WHERE id = $6", user.FirstName, user.LastName, user.Email, user.Role, user.Flags, id)
	if err != nil {
		return nil, fmt.Errorf("error updating user: %w", err)
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
