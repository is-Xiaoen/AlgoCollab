package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"go.uber.org/zap"
)

// LoggerMiddleware 请求日志中间件
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开始时间
		start := time.Now()

		// 请求路径
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// 处理请求
		c.Next()

		// 计算耗时
		latency := time.Since(start)

		// 获取相应状态
		status := c.Writer.Status()

		// 记录日志
		fields := []zap.Field{
			zap.Int("status", status),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("query", raw),
			zap.String("ip", c.ClientIP()),
			zap.String("user-agent", c.Request.UserAgent()),
			zap.Duration("latency", latency),
		}

		// 如果有错误, 记录错误信息
		if len(c.Errors) > 0 {
			fields = append(fields, zap.Error(c.Errors[0]))
		}

		// 根据状态码决定日志级别
		if status >= 500 {
			logger.Error("Server Error", fields...)
		} else if status >= 400 {
			logger.Warn("Client Error", fields...)
		} else {
			logger.Info("Request", fields...)
		}
	}
}
