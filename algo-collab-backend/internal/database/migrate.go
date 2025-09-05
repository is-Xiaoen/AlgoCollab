package database

import (
	"log"

	"github.com/is-Xiaoen/algo-collab/internal/models"
)

// AutoMigrate 自动迁移数据库表
func AutoMigrate() error {
	// 自动创建或更新表结构
	err := DB.AutoMigrate(
		&models.User{},
		&models.Room{},
		// 后续添加更多模型...
	)

	if err != nil {
		return err
	}

	log.Println("✅ 数据库表迁移完成")
	return nil
}
