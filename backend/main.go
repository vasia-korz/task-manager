package main

import (
	"net/http"

	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/vasia-korz/task-manager/middleware"
	"github.com/vasia-korz/task-manager/models"
)

func main() {
	err := models.ConnectDatabase()

	if err != nil {
		panic("Failed to connect to the database: " + err.Error())
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://symphonious-marigold-3e8221.netlify.app"}, // Allow frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},         // HTTP methods
		AllowHeaders:     []string{"Authorization", "Content-Type"},                   // Allowed headers
		ExposeHeaders:    []string{"Authorization"},                                   // Expose any custom headers
		AllowCredentials: true,                                                        // Allow cookies if needed
		MaxAge:           12 * time.Hour,                                              // Cache preflight response
	}))

	authRouter := r.Group("/auth")
	{
		authRouter.POST("/register", func(c *gin.Context) { models.Register(models.DB, c) })
		authRouter.POST("/login", func(c *gin.Context) { models.Login(models.DB, c) })
	}

	router := r.Group("/tasks", middleware.AuthMiddleware())
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
