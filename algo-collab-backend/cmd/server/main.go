package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/internal/config"
	"github.com/is-Xiaoen/algo-collab/internal/database"
	"github.com/is-Xiaoen/algo-collab/internal/middleware"
	"github.com/is-Xiaoen/algo-collab/internal/repository"
	"github.com/is-Xiaoen/algo-collab/internal/router"
	"github.com/is-Xiaoen/algo-collab/internal/service"
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

	// 初始化 Redis
	if err := database.InitRedis(&config.GlobalConfig.Redis); err != nil {
		logger.Fatal("Redis 连接失败", zap.Error(err))
	}
	defer database.CloseRedis()

	// 4. 初始化 Gin
	// 初始化服务层
	userRepo := repository.NewUserRepository(database.DB)
	authService := service.NewAuthService(userRepo, &config.GlobalConfig.JWT)

	if config.GlobalConfig.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	// 5.应用全局中间件
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RecoveryMiddleware())
	r.Use(middleware.CORSMiddleware(&config.GlobalConfig.CORS))

	// 设置路由
	newRouter := router.NewRouter(authService)
	newRouter.Setup(r)

	// 7. 启动服务器
	addr := fmt.Sprintf(":%d", config.GlobalConfig.App.Port)
	logger.Info("✅ 服务器启动成功", zap.String("address", addr))

	if err := r.Run(addr); err != nil {
		logger.Fatal("服务器启动失败", zap.Error(err))
	}

}
