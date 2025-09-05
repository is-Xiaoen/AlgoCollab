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
				// TODO(human): 实现panic恢复逻辑
				// 1. 记录错误日志（包含堆栈信息）
				// 记录日志
				fields := []zap.Field{
					zap.Int("status", 500),
					zap.String("Stack trace:%s", string(debug.Stack())),
				}
				logger.Error("panic", fields...)
				// 2. 返回500错误给客户端
				c.JSON(500, gin.H{"code": 500,
					"message": "Internal Server Error"})
				// 3. 确保响应格式统一
			}
		}()

		c.Next()
	}
}
