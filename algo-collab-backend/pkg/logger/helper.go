package logger

import (
	"go.uber.org/zap"
)

// 便捷函数 - 直接使用全局 Logger

func Debug(msg string, fields ...zap.Field) {
	Logger.Debug(msg, fields...)
}

func Info(msg string, fields ...zap.Field) {
	Logger.Info(msg, fields...)
}

func Warn(msg string, fields ...zap.Field) {
	Logger.Warn(msg, fields...)
}

// Error 系统错误日志（带堆栈）
func Error(msg string, fields ...zap.Field) {
	Logger.Error(msg, fields...)
}

// BusinessWarn 业务警告日志（不带堆栈）- 用于业务验证失败等场景
func BusinessWarn(msg string, fields ...zap.Field) {
	Logger.Warn(msg, fields...)
}

// BusinessError 业务错误日志（不带堆栈）- 用于业务逻辑错误
func BusinessError(msg string, fields ...zap.Field) {
	Logger.Error(msg, fields...)
}

func Fatal(msg string, fields ...zap.Field) {
	Logger.Fatal(msg, fields...)
}

// WithContext 创建带上下文的 Logger
func WithContext(ctx map[string]interface{}) *zap.Logger {
	fields := make([]zap.Field, 0, len(ctx))
	for k, v := range ctx {
		fields = append(fields, zap.Any(k, v))
	}
	return Logger.With(fields...)
}
