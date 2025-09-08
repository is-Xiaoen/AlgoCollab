package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/internal/service"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"github.com/is-Xiaoen/algo-collab/pkg/response"
	"go.uber.org/zap"
)

// AuthController 认证控制器
type AuthController struct {
	authService service.AuthService
}

// NewAuthController 创建认证控制器实例
func NewAuthController(authService service.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
	}
}

// Register 用户注册
func (c *AuthController) Register(ctx *gin.Context) {
	// 1. 参数绑定和验证
	var req service.RegisterRequest
	if err := ctx.ShouldBind(&req); err != nil {
		logger.Warn("注册参数验证失败", zap.Error(err))
		response.Error(ctx, 200, 4001, "参数验证失败: "+err.Error())
		return
	}

	// 2. 调用服务层处理
	resp, err := c.authService.Register(ctx.Request.Context(), &req)
	if err != nil {
		logger.Error("用户注册失败",
			zap.String("username", req.Username),
			zap.String("email", req.Email),
			zap.Error(err))
		response.Error(ctx, 200, 5001, err.Error())
	}

	// 3.返回成功响应
	logger.Info("用户注册成功",
		zap.String("username", req.Username),
		zap.String("email", req.Email))

	response.Success(ctx, "注册成功", resp)
}

// Login 用户登录
func (c *AuthController) Login(ctx *gin.Context) {
	// 1. 参数绑定和验证
	var req service.LoginRequest
	if err := ctx.ShouldBind(&req); err != nil {
		logger.Warn("注册参数验证失败", zap.Error(err))
		response.Error(ctx, 200, 4001, "参数验证失败: "+err.Error())
		return
	}

	// 2. 获取客户端IP(用于登录日志和安全检测)
	clientIP := ctx.ClientIP()
	userAgent := ctx.GetHeader("User-Agent")

	// 3. 调用服务层处理
	resp, err := c.authService.Login(ctx.Request.Context(), &req)
	if err != nil {
		logger.Error("用户注册失败",
			zap.String("email", req.Email),
			zap.String("ip", clientIP),
			zap.String("user_agent", userAgent),
			zap.Error(err))
		response.Error(ctx, 200, 5001, err.Error())
	}

	// 4.返回成功响应
	logger.Info("用户登录成功",
		zap.String("email", req.Email),
		zap.String("ip", clientIP))

	response.Success(ctx, "登录成功", resp)
}

// RefreshToken 刷新Token
func (c *AuthController) RefreshToken(ctx *gin.Context) {
	// 1. 参数绑定和验证
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, 200, 4001, "参数验证失败: "+err.Error())
		return
	}

	// 2. 调用服务层处理
	resp, err := c.authService.RefreshToken(ctx.Request.Context(), req.RefreshToken)
	if err != nil {
		logger.Warn("Token刷新失败", zap.Error(err))
		response.Error(ctx, 200, 5001, err.Error())
	}

	// 4.返回成功响应
	response.Success(ctx, "刷新token成功", resp)
}

// Logout 用户登出
func (c *AuthController) Logout(ctx *gin.Context) {

	// 1.从Header获取Token
	token := ctx.GetHeader("Authorization")
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	if token == "" {
		response.Error(ctx, 200, 401, "未提供Token")
		return
	}

	// 2. 调用服务层处理
	err := c.authService.Logout(ctx.Request.Context(), token)
	if err != nil {
		logger.Error("登出失败", zap.Error(err))
		response.Error(ctx, 200, 5001, err.Error())
	}

	// 4.返回成功响应
	response.Success(ctx, "登出成功", nil)
}

// GetCurrentUser 获取当前用户信息
func (c *AuthController) GetCurrentUser(ctx *gin.Context) {
	// 从Context中获取用户信息（由JWT中间件设置）
	userID, exists := ctx.Get("user_id")
	if !exists {
		response.Unauthorized(ctx, "未授权")
		return
	}

	username, _ := ctx.Get("username")
	email, _ := ctx.Get("email")
	role, _ := ctx.Get("role")

	// 构造响应
	userInfo := gin.H{
		"user_id":  userID,
		"username": username,
		"email":    email,
		"role":     role,
	}

	response.Success(ctx, "获取成功", userInfo)
}
