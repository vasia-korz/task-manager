package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/vasia-korz/task-manager/models"
)

func main() {
	err := models.ConnectDatabase()

	if err != nil {
		return
	}

	r := gin.Default()
	r.Use(cors.Default())

	router := r.Group("/tasks")
	{
		router.POST("/create", postTask)
		router.GET("/", readTasks)
		router.POST("/update/:id", updateTask)
		router.GET("/delete/:id", deleteTask)
	}

	r.Run()
}

func readTasks(c *gin.Context) {
	tasks, err := models.GetTasks(c)
	checkErr(c, err, http.StatusNotFound)

	if err != nil {
		return
	}

	c.JSON(200, gin.H{"data": tasks})
}

func postTask(c *gin.Context) {
	newTask, err := models.PostTask(c)
	checkErr(c, err, http.StatusBadRequest)

	if err != nil {
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": newTask})
}

func updateTask(c *gin.Context) {
	updatedTask, err := models.UpdateTask(c)
	checkErr(c, err, http.StatusNotFound)

	if err != nil {
		return
	}

	c.JSON(200, gin.H{"data": updatedTask})
}

func deleteTask(c *gin.Context) {
	err := models.DeleteTask(c)
	checkErr(c, err, http.StatusNotFound)

	if err != nil {
		return
	}

	c.JSON(200, gin.H{"message": "Deleted successfully"})
}

func checkErr(c *gin.Context, err error, statusCode int) {
	if err != nil {
		c.JSON(statusCode, gin.H{"error": err.Error()})
		c.Abort()
	}
}
