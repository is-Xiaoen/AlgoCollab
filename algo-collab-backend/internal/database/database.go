package database

import (
	"fmt"
	"log"
	"time"

	"github.com/is-Xiaoen/algo-collab/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB // 全局数据库连接

// Init 初始化数据库连接
func Init(cfg *config.DatabaseConfig) error {
	var err error

	// 1. 构建 DSN (Data Source Name)
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai",
		cfg.Host,
		cfg.Username,
		cfg.Password,
		cfg.Database,
		cfg.Port,
	)

	// 2. 配置 GORM
	gormConfig := &gorm.Config{
		// 日志级别
		Logger: logger.Default.LogMode(logger.Info),
		// 禁用外键约束 (提高性能)
		DisableForeignKeyConstraintWhenMigrating: true,
		// 创建时间、更新时间使用数据库时间
		NowFunc: func() time.Time {
			return time.Now().Local()
		},
	}

	// 3. 连接数据库
	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	// 4. 获取底层 SQL 连接池
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("获取数据库连接池失败: %w", err)
	}

	// 5. 配置连接池
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns) // 最大空闲连接数
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns) // 最大打开连接数
	sqlDB.SetConnMaxLifetime(time.Duration(cfg.ConnMaxLifetime) * time.Second)

	log.Println("✅ 数据库连接成功")
	return nil
}

// Close 关闭数据库连接
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
