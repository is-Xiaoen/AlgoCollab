package middleware

import (
	"fmt"
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
		allowed := false
		for _, allowOrigin := range cfg.AllowOrigins {
			if origin == allowOrigin || allowOrigin == "*" {
				c.Header("Access-Control-Allow-Origin", origin)
				allowed = true
				break
			}
		}

		// 如果origin被允许，设置其他CORS头
		if allowed {
			// 从配置中读取允许的方法，转换为字符串
			methods := ""
			for i, method := range cfg.AllowMethods {
				if i > 0 {
					methods += ", "
				}
				methods += method
			}
			c.Header("Access-Control-Allow-Methods", methods)

			// 从配置中读取允许的头部
			headers := ""
			for i, header := range cfg.AllowHeaders {
				if i > 0 {
					headers += ", "
				}
				headers += header
			}
			c.Header("Access-Control-Allow-Headers", headers)

			// 设置credentials（从配置读取）
			if cfg.AllowCredentials {
				c.Header("Access-Control-Allow-Credentials", "true")
			}

			// 设置预检请求缓存时间
			c.Header("Access-Control-Max-Age", fmt.Sprintf("%d", cfg.MaxAge))
		}

		// OPTIONS请求直接返回
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
