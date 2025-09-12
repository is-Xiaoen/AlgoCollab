package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/internal/service"
)

// AuthMiddleware JWT 认证中间件
func AuthMiddleware(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取 Token
		token := extractToken(c)
		if token == "" {
			c.JSON(401, gin.H{
				"code":    401,
				"message": "未提供认证令牌",
				"data":    nil,
			})
			c.Abort()
			return
		}

		// 2. 验证 Token
		claims, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(401, gin.H{
				"code":    401,
				"message": "无效的认证令牌: " + err.Error(),
				"data":    nil,
			})
			c.Abort()
			return
		}

		// 3. 将用户信息存入 Context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// extractToken 从请求中提取 Token
func extractToken(c *gin.Context) string {
	// 1. 从 Header 获取
	bearerToken := c.GetHeader("Authorization")
	if bearerToken != "" {
		parts := strings.Split(bearerToken, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
	}

	// 2. 从 Query 获取（WebSocket 连接使用）
	return c.Query("token")
}

// RequireRole 角色验证中间件
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(403, gin.H{
				"code":    403,
				"message": "无权限访问",
				"data":    nil,
			})
			c.Abort()
			return
		}

		// 检查角色
		for _, role := range roles {
			if userRole == role {
				c.Next()
				return
			}
		}

		c.JSON(403, gin.H{
			"code":    403,
			"message": "权限不足",
			"data":    nil,
		})
		c.Abort()
	}
}
