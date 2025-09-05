package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/internal/config"
)

// CORSMiddleware 跨域中间件
func CORSMiddleware(cfg *config.CORSConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 设置CORS头
		origin := c.Request.Header.Get("Origin")

		// 检查origin是否在允许列表中
		for _, allowOrigin := range cfg.AllowOrigins {
			if origin == allowOrigin || allowOrigin == "*" {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Id")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")

		// OPTIONS请求直接返回
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
