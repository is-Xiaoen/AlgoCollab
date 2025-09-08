package router

import (
	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/internal/controller"
	"github.com/is-Xiaoen/algo-collab/internal/middleware"
	"github.com/is-Xiaoen/algo-collab/internal/service"
)

// Router 路由管理器
type Router struct {
	authController *controller.AuthController
	authService    service.AuthService
}

// NewRouter 创建路由管理器
func NewRouter(authService service.AuthService) *Router {
	return &Router{
		authController: controller.NewAuthController(authService),
		authService:    authService,
	}
}

// Setup 初始化所有路由
func (r *Router) Setup(engine *gin.Engine) {
	// 1. 全局中间件
	// TODO: 添加全局中间件

	// 2. API路由组
	api := engine.Group("/api")
	{
		// 版本1的路由
		v1 := api.Group("/v1")
		{
			// 认证相关路由（不需要JWT验证）
			auth := v1.Group("/auth")
			{
				auth.POST("register", r.authController.Register)
				auth.POST("login", r.authController.Login)
				auth.POST("refresh", r.authController.Refresh)
			}

			// 需要认证的路由
			protected := v1.Group("")
			protected.Use(middleware.AuthMiddleware(r.authService))
			{
				protected.POST("logout", r.authController.Logout)
				protected.POST("me", r.authController.GetCurrentUser)
			}
		}
	}
}
