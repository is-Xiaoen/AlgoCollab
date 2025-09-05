package main

import (
	"fmt"
	"log"

	"github.com/is-Xiaoen/algo-collab/internal/config"
	"github.com/is-Xiaoen/algo-collab/internal/database"
	"github.com/is-Xiaoen/algo-collab/internal/models"
)

func main() {
	// 加载配置
	err := config.Load("configs/config.yaml")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	fmt.Println("✅ 配置加载成功")

	// 2. 连接数据库
	err = database.Init(&config.GlobalConfig.Database)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	defer database.Close()

	// 3. 自动迁移
	err = database.AutoMigrate()
	if err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}

	// 4. 测试创建用户
	testUser := &models.User{
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: "hashed_password_here",
		Role:         "user",
		Status:       "active",
	}

	result := database.DB.Create(testUser)
	if result.Error != nil {
		log.Printf("创建用户失败: %v", result.Error)
	} else {
		fmt.Printf("✅ 创建测试用户成功，ID: %d\n", testUser.ID)
	}

	// 5. 查询用户
	var users []models.User
	database.DB.Find(&users)
	fmt.Printf("📊 数据库中有 %d 个用户\n", len(users))
}
