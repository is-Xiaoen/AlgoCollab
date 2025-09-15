package database

import (
	"context"
	"fmt"
	"time"

	"github.com/is-Xiaoen/algo-collab/internal/config"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// RedisClient 全局 Redis 客户端
var RedisClient *redis.Client

// InitRedis 初始化 Redis 连接
func InitRedis(cfg *config.RedisConfig) error {
	// 创建 Redis 客户端
	// redis.Options 包含所有连接配置
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Host, cfg.Port), // Redis 地址，如 "localhost:6379"
		Password: cfg.Password,                             // 密码，没有就是空字符串
		DB:       cfg.DB,                                   // 数据库编号，Redis有16个db（0-15）
		PoolSize: cfg.PoolSize,                             // 连接池大小，控制并发连接数

		// 连接超时配置
		DialTimeout:  5 * time.Second, // 建立连接的超时时间
		ReadTimeout:  3 * time.Second, // 读取超时
		WriteTimeout: 3 * time.Second, // 写入超时
	})
	// 测试连接
	// Ping 命令用于检查 Redis 服务器是否响应
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		logger.Error("Redis 连接失败", zap.Error(err))
		return fmt.Errorf("redis连接失败: %w", err)
	}

	logger.Info("✅ Redis 连接成功",
		zap.String("addr", fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)),
	)

	return nil
}

// CloseRedis 关闭 Redis 连接
func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}

// SetWithExpiration 设置键值对并设置过期时间
// 用途：存储临时数据，如验证码、临时token
func SetWithExpiration(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return RedisClient.Set(ctx, key, value, expiration).Err()
}

// Get 获取值
func Get(ctx context.Context, key string) (string, error) {
	return RedisClient.Get(ctx, key).Result()
}

// Delete 删除键
func Delete(ctx context.Context, keys ...string) error {
	return RedisClient.Del(ctx, keys...).Err()
}

// Exists 检查键是否存在
func Exists(ctx context.Context, key string) (bool, error) {
	n, err := RedisClient.Exists(ctx, key).Result()
	return n > 0, err
}
