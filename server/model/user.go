package model

import "time"

type User struct {
	ID        int                    `json:"id"`
	FirstName string                 `json:"first_name"`
	LastName  string                 `json:"last_name"`
	Email     string                 `json:"email"`
	Role      string                 `json:"role"`
	CreatedAt time.Time              `json:"created_at"`
	Flags     map[string]interface{} `json:"flags"`
}
