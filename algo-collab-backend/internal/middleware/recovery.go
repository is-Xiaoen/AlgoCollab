package middleware

import (
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"go.uber.org/zap"
)

// RecoveryMiddleware panic恢复中间件
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 获取堆栈信息
				stack := debug.Stack()

				// 记录详细的错误日志
				logger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
					zap.String("client_ip", c.ClientIP()),
					zap.String("stack", string(stack)),
				)

				// 确保之前的响应被清除
				c.Abort()

				// 返回统一格式的错误响应
				c.JSON(500, gin.H{
					"code":    500,
					"message": "Internal Server Error",
					"data":    nil,
				})
			}
		}()

		c.Next()
	}
}
