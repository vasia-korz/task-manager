package models

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDatabase() error {
	connStr := os.Getenv("DATABASE_URL")

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	if err := db.Ping(); err != nil {
		return err
	}

	DB = db

	err = createTables()
	if err != nil {
		return err
	}

	return nil
}

func createTables() error {
	createUsersTable := `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );`

	createTasksTable := `
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            comment TEXT,
            deadline TIMESTAMP,
            done TEXT,
            planned BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP,
            user_id INT REFERENCES users(id) ON DELETE CASCADE
        );`

	_, err := DB.Exec(createUsersTable)
	if err != nil {
		return err
	}

	_, err = DB.Exec(createTasksTable)
	if err != nil {
		return err
	}

	return nil
}

type Task struct {
	Id           int        `json:"id"`
	Title        string     `json:"title"`
	Comment      string     `json:"comment"`
	Deadline     time.Time  `json:"deadline"`
	Done         string     `json:"done"`
	Planned      bool       `json:"planned"`
	Created_at   time.Time  `json:"createdAt"`
	Completed_at *time.Time `json:"completedAt"`
	UserID       int        `json:"userId"`
}

type TaskUpdate struct {
	Title    *string    `json:"title"`
	Comment  *string    `json:"comment"`
	Deadline *time.Time `json:"deadline"`
	Done     *string    `json:"done"`
	Planned  *bool      `json:"planned"`
}

func GetTasks(c *gin.Context) ([]Task, error) {
	userID := c.GetInt("userID")

	showDoneStr := c.Query("showDone")
	deadlineProximityStr := c.Query("deadlineProximity")

	showDone := true
	if showDoneStr == "false" {
		showDone = false
	}

	var deadlineProximity *time.Time
	if deadlineProximityStr != "" {
		parsedDeadline, err := time.Parse("2006-01-02T15:04:05Z07:00", deadlineProximityStr)
		if err != nil {
			return nil, err
		}
		deadlineProximity = &parsedDeadline
	}

	var rows *sql.Rows
	var err error

	if showDone && deadlineProximity == nil {
		rows, err = DB.Query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline", userID)
	} else if !showDone && deadlineProximity == nil {
		rows, err = DB.Query("SELECT * FROM tasks WHERE user_id = $1 AND done IN ('progress', 'todo') ORDER BY deadline", userID)
	} else if showDone {
		rows, err = DB.Query("SELECT * FROM tasks WHERE user_id = $1 AND deadline <= $2 ORDER BY deadline", userID, deadlineProximity)
	} else {
		rows, err = DB.Query("SELECT * FROM tasks WHERE user_id = $1 AND deadline <= $2 AND done IN ('progress', 'todo') ORDER BY deadline", userID, deadlineProximity)
	}

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	tasks := make([]Task, 0)

	for rows.Next() {
		singleTask := Task{}
		err = rows.Scan(
			&singleTask.Id,
			&singleTask.Title,
			&singleTask.Comment,
			&singleTask.Deadline,
			&singleTask.Done,
			&singleTask.Planned,
			&singleTask.Created_at,
			&singleTask.Completed_at,
			&singleTask.UserID,
		)

		if err != nil {
			return nil, err
		}

		tasks = append(tasks, singleTask)
	}

	err = rows.Err()

	if err != nil {
		return nil, err
	}

	return tasks, nil
}

func PostTask(c *gin.Context) (*Task, error) {
	userID := c.GetInt("userID")

	var newTask Task

	if err := c.ShouldBindJSON(&newTask); err != nil {
		return nil, err
	}

	newTask.Created_at = time.Now().UTC()

	var lastInsertId int
	err := DB.QueryRow(
		"INSERT INTO tasks (title, comment, deadline, done, planned, created_at, completed_at, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
		newTask.Title, newTask.Comment, newTask.Deadline, newTask.Done, newTask.Planned, newTask.Created_at, newTask.Completed_at, userID,
	).Scan(&lastInsertId)

	if err != nil {
		return nil, err
	}

	newTask.Id = int(lastInsertId)
	newTask.UserID = userID

	return &newTask, nil
}

func UpdateTask(c *gin.Context) (*Task, error) {
	userID := c.GetInt("userID")

	var incomingTask TaskUpdate

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		return nil, fmt.Errorf("invalid task ID")
	}

	if err := c.ShouldBindJSON(&incomingTask); err != nil {
		return nil, err
	}

	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1 AND user_id = $2)", id, userID).Scan(&exists)

	if err != nil {
		return nil, err
	}

	if !exists {
		return nil, fmt.Errorf("task not found")
	}

	var existingTask Task
	err = DB.QueryRow("SELECT id, title, comment, deadline, done, planned, created_at, completed_at, user_id FROM tasks WHERE id = $1 AND user_id = $2",
		id, userID).Scan(
		&existingTask.Id,
		&existingTask.Title,
		&existingTask.Comment,
		&existingTask.Deadline,
		&existingTask.Done,
		&existingTask.Planned,
		&existingTask.Created_at,
		&existingTask.Completed_at,
		&existingTask.UserID,
	)

	if incomingTask.Title != nil {
		existingTask.Title = *incomingTask.Title
	}
	if incomingTask.Comment != nil {
		existingTask.Comment = *incomingTask.Comment
	}
	if incomingTask.Deadline != nil {
		existingTask.Deadline = *incomingTask.Deadline
	}

	if err != nil {
		return nil, err
	}

	/*
	* If that task is set to done, then planned is set to false.
	* If the task is set to progress / todo, then planned is changed independently.
	 */
	if incomingTask.Done != nil && *incomingTask.Done == "done" && existingTask.Done != "done" {
		existingTask.Done = "done"
		existingTask.Completed_at = new(time.Time) // allocate memory
		*existingTask.Completed_at = time.Now().UTC()
		existingTask.Planned = false
	} else {
		if incomingTask.Done != nil && *incomingTask.Done != existingTask.Done {
			existingTask.Done = *incomingTask.Done
		}
		if incomingTask.Planned != nil && *incomingTask.Planned != existingTask.Planned {
			existingTask.Planned = *incomingTask.Planned
		}
	}

	_, err = DB.Exec(
		"UPDATE tasks SET title = $1, comment = $2, deadline = $3, done = $4, planned = $5, completed_at = $6 WHERE id = $7 AND user_id = $8",
		existingTask.Title,
		existingTask.Comment,
		existingTask.Deadline,
		existingTask.Done,
		existingTask.Planned,
		existingTask.Completed_at,
		existingTask.Id,
		userID,
	)

	if err != nil {
		return nil, err
	}

	return &existingTask, nil
}

func DeleteTask(c *gin.Context) error {
	userID := c.GetInt("userID")

	id_str := c.Param("id")

	if id_str == "" {
		return fmt.Errorf("task ID is required")
	}

	id, _ := strconv.Atoi(id_str)

	var exists bool
	err := DB.QueryRow("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1 AND user_id = $2)", id, userID).Scan(&exists)

	if err != nil {
		return err
	}

	if !exists {
		return fmt.Errorf("task not found")
	}

	_, err = DB.Exec("DELETE FROM tasks WHERE id = $1 AND user_id = $2", id, userID)

	if err != nil {
		return err
	}

	return nil
}
