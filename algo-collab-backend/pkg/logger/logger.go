package logger

import (
	"os"
	"time"

	"github.com/is-Xiaoen/algo-collab/internal/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	Logger *zap.Logger        // 全局 Logger
	Sugar  *zap.SugaredLogger // Sugar Logger（更简单的API）
)

// Init 初始化日志系统
func Init(cfg *config.LogConfig) error {
	// 1. 设置日志级别
	level := getLogLevel(cfg.Level)

	// 2. 设置日志编码器（输出格式）
	encoder := getEncoder(cfg.Format)

	// 3. 设置日志输出位置
	writeSyncer := getWriteSyncer(cfg.Output, cfg.FilePath)

	// 4. 创建 Core
	core := zapcore.NewCore(encoder, writeSyncer, level)

	// 5. 创建 Logger（添加调用者信息和堆栈追踪）
	Logger = zap.New(core,
		zap.AddCaller(),                       // 添加调用位置
		zap.AddStacktrace(zapcore.ErrorLevel), // Error级别以上添加堆栈
	)

	Sugar = Logger.Sugar()

	return nil
}

// getLogLevel 解析日志级别
func getLogLevel(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	default:
		return zapcore.InfoLevel
	}
}

// getEncoder 获取编码器
func getEncoder(format string) zapcore.Encoder {
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		FunctionKey:    zapcore.OmitKey,
		MessageKey:     "message",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder, // 小写级别
		EncodeTime:     customTimeEncoder,             // 自定义时间格式
		EncodeDuration: zapcore.StringDurationEncoder, // 字符串格式的duration
		EncodeCaller:   zapcore.ShortCallerEncoder,    // 短路径
	}

	if format == "json" {
		return zapcore.NewJSONEncoder(encoderConfig)
	}

	// Console 格式（开发环境友好）
	encoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder // 彩色输出
	return zapcore.NewConsoleEncoder(encoderConfig)
}

// customTimeEncoder 自定义时间格式
func customTimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format("2006-01-02 15:04:05.000"))
}

// getWriteSyncer 获取输出位置
func getWriteSyncer(output string, filePath string) zapcore.WriteSyncer {
	if output == "file" {
		file, _ := os.OpenFile(filePath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
		return zapcore.AddSync(file)
	}

	// 默认输出到控制台
	return zapcore.AddSync(os.Stdout)
}

// Sync 刷新日志缓冲区
func Sync() {
	if Logger != nil {
		Logger.Sync()
	}
}
