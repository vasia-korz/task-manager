package models

import (
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func ConnectDatabase() error {
	db, err := sql.Open("sqlite3", "./sqlite.db")
	if err != nil {
		return err
	}

	DB = db
	return nil
}

type Task struct {
	Id         int       `json:"id"`
	Title      string    `json:"title"`
	Comment    string    `json:"comment"`
	Deadline   time.Time `json:"deadline"`
	Priority   string    `json:"priority"`
	Created_at time.Time `json:"createdAt"`
}

func GetTasks() ([]Task, error) {
	rows, err := DB.Query("SELECT * FROM tasks")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	tasks := make([]Task, 0)

	for rows.Next() {
		singleTask := Task{}
		err = rows.Scan(&singleTask.Id, &singleTask.Title, &singleTask.Comment, &singleTask.Deadline, &singleTask.Priority, &singleTask.Created_at)

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
	var newTask Task

	if err := c.ShouldBindJSON(&newTask); err != nil {
		return nil, err
	}

	newTask.Created_at = time.Now()

	result, err := DB.Exec("INSERT INTO tasks (title, comment, deadline, priority, created_at) VALUES (?, ?, ?, ?, ?)",
		newTask.Title, newTask.Comment, newTask.Deadline, newTask.Priority, newTask.Created_at)

	if err != nil {
		return nil, err
	}

	lastInsertId, err := result.LastInsertId()

	if err != nil {
		return nil, err
	}

	newTask.Id = int(lastInsertId)

	return &newTask, nil
}

func UpdateTask(c *gin.Context) (*Task, error) {
	var incomingTask Task

	id := c.Param("id")

	if err := c.ShouldBindJSON(&incomingTask); err != nil {
		return nil, err
	}

	if id == "" {
		return nil, fmt.Errorf("Task ID is required")
	}

	incomingTask.Id, _ = strconv.Atoi(id)

	var exists bool
	err := DB.QueryRow("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = ?)", incomingTask.Id).Scan(&exists)

	if err != nil {
		return nil, err
	}

	if !exists {
		return nil, fmt.Errorf("Task not found")
	}

	var existingTask Task
	err = DB.QueryRow("SELECT id, title, comment, deadline, priority, created_at FROM tasks WHERE id = ?", incomingTask.Id).Scan(
		&existingTask.Id, &existingTask.Title, &existingTask.Comment, &existingTask.Deadline, &existingTask.Priority, &existingTask.Created_at)

	if incomingTask.Title != "" {
		existingTask.Title = incomingTask.Title
	}
	if incomingTask.Comment != "" {
		existingTask.Comment = incomingTask.Comment
	}
	if !incomingTask.Deadline.IsZero() {
		existingTask.Deadline = incomingTask.Deadline
	}
	if incomingTask.Priority != "" {
		existingTask.Priority = incomingTask.Priority
	}

	if err != nil {
		return nil, err
	}

	_, err = DB.Exec("UPDATE tasks SET title = ?, comment = ?, deadline = ?, priority = ? WHERE id = ?",
		existingTask.Title, existingTask.Comment, existingTask.Deadline, existingTask.Priority, existingTask.Id)

	if err != nil {
		return nil, err
	}

	return &existingTask, nil
}

func DeleteTask(c *gin.Context) error {
	id_str := c.Param("id")

	if id_str == "" {
		return fmt.Errorf("Task ID is required")
	}

	id, _ := strconv.Atoi(id_str)

	var exists bool
	err := DB.QueryRow("SELECT EXISTS(SELECT 1 FROM tasks WHERE id = ?)", id).Scan(&exists)

	if err != nil {
		return err
	}

	if !exists {
		return fmt.Errorf("Task not found")
	}

	_, err = DB.Exec("DELETE FROM tasks WHERE id = ?", id)

	if err != nil {
		return err
	}

	return nil
}
