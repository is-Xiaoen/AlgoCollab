package main

import (
	"fmt"
	"log"

	"github.com/is-Xiaoen/algo-collab/internal/config"
)

func main() {
	// 加载配置
	err := config.Load("configs/config.yaml")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 打印测试
	fmt.Printf("应用名称: %s\n", config.GlobalConfig.App.Name)
	fmt.Printf("运行环境: %s\n", config.GlobalConfig.App.Env)
	fmt.Printf("服务端口: %d\n", config.GlobalConfig.App.Port)
}
