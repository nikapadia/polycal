package model

import "time"

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
