package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/internal/config"
	"github.com/is-Xiaoen/algo-collab/internal/database"
	"github.com/is-Xiaoen/algo-collab/internal/middleware"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	// 加载配置
	err := config.Load("configs/config.yaml")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 2. 初始化日志
	if err := logger.Init(&config.GlobalConfig.Log); err != nil {
		log.Fatalf("初始化日志失败: %v", err)
	}
	defer logger.Sync()

	logger.Info("🚀 服务启动中...",
		zap.String("env", config.GlobalConfig.App.Env),
		zap.Int("port", config.GlobalConfig.App.Port),
	)

	// 3. 连接数据库
	err = database.Init(&config.GlobalConfig.Database)
	if err != nil {
		logger.Fatal("数据库连接失败", zap.Error(err))
	}
	defer database.Close()

	// 4. 初始化 Gin
	if config.GlobalConfig.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	// 5. 应用中间件
	router.Use(
		middleware.LoggerMiddleware(),
		middleware.RecoveryMiddleware(),
		middleware.CORSMiddleware(&config.GlobalConfig.CORS),
	)

	// 6. 测试路由
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"message": "AlgoCollab Backend is running",
		})
	})

	// 7. 启动服务器
	addr := fmt.Sprintf(":%d", config.GlobalConfig.App.Port)
	logger.Info("✅ 服务器启动成功", zap.String("address", addr))

	if err := router.Run(addr); err != nil {
		logger.Fatal("服务器启动失败", zap.Error(err))
	}

}
