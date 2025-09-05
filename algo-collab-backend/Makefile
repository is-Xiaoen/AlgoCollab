#Makefile 是自动化构建的利器，就像给你的项目配置了一系列"快捷键"。在大厂项目中，Makefile
#  能让团队成员用统一的命令来构建、测试、部署，避免"在我电脑上能跑"的问题。它本质上是定义了一系列的任务（target）和它们的执行命令。

#  Makefile 要点解释
#
#  1. .PHONY：声明伪目标（不生成文件的目标）
#  2. 变量：$(变量名) 使用变量，便于维护
#  3. Shell 命令：$(shell 命令) 执行 shell 命令并获取输出
#  4. @符号：在命令前加 @ 表示不显示命令本身，只显示输出
#  5. 依赖链：check: fmt vet test 表示 check 依赖这三个目标

# 变量定义
APP_NAME=algocollab-server
VERSION=$(shell git describe --tags --always --dirty)
BUILD_TIME=$(shell date +%Y%m%d-%H%M%S)
GO_VERSION=$(shell go version | awk '{print $$3}')

# 颜色输出 (让输出更好看)
RED=\033[0;31m
GREEN=\033[0;32M
yellow=\033[1;33m
NC=\033[0m # No Color

# 默认目标
.DEFAULT_GOAL := help

## help: 显示帮助信息
.PHONY: help
help:
	@echo "$(GREEN)AlgoCollab Backend Makefile$(NC)"
	@echo "$(YELLOW)使用方法: make [目标]$(NC)"
	@echo ""
	@echo "可用目标:"
	@grep -E '^##' Makefile | sed 's/## /  /'

## init: 初始化项目 (下载依赖)
.PHONY: init
init:
	@echo "$(GREEN)初始化项目...$(NC)"
	go mod download
	go mod tidy
	@echo "$(GREEN)✓ 依赖安装完成$(NC)"

## build: 编译项目
.PHONY: build
build:
	@echo "$(GREEN)编译项目...$(NC)"
	@echo "版本: $(VERSION)"
	@echo "Go版本: $(GO_VERSION)"
	go build -o bin/$(APP_NAME) cmd/server/main.go
	@echo "$(GREEN)✓ 编译完成: bin/$(APP_NAME)$(NC)"

## run: 运行项目
.PHONY: run
run:
	@echo "$(GREEN)启动服务...$(NC)"
	go run cmd/server/main.go

## test: 运行测试
.PHONY: test
test:
	@echo "$(GREEN)运行测试...$(NC)"
	go test -v -cover ./...
	@echo "$(GREEN)✓ 测试完成$(NC)"

## clean: 清理编译产物
.PHONY: clean
clean:
	@echo "$(YELLOW)清理文件...$(NC)"
	rm -rf bin/
	rm -rf logs/
	@echo "$(GREEN)✓ 清理完成$(NC)"

## fmt: 格式化代码
.PHONY: fmt
fmt:
	@echo "$(GREEN)格式化代码...$(NC)"
	go fmt ./...
	@echo "$(GREEN)✓ 格式化完成$(NC)"

## vet: 静态检查
.PHONY: vet
vet:
	@echo "$(GREEN)运行静态检查...$(NC)"
	go vet ./...
	@echo "$(GREEN)✓ 检查完成$(NC)"

## lint: 运行 golangci-lint（需要先安装）
.PHONY: lint
lint:
	@echo "$(GREEN)运行代码检查...$(NC)"
	@which golangci-lint > /dev/null || (echo "$(RED)请先安装 golangci-lint$(NC)" && exit 1)
	golangci-lint run ./...
	@echo "$(GREEN)✓ 代码检查完成$(NC)"

## dev: 开发模式（自动重启）
.PHONY: dev
dev:
	@echo "$(GREEN)启动开发模式...$(NC)"
	@which air > /dev/null || (echo "$(YELLOW)安装 air 热重载工具...$(NC)" && go install github.com/cosmtrek/air@latest)
	air

## docker-build: 构建 Docker 镜像
.PHONY: docker-build
docker-build:
	@echo "$(GREEN)构建 Docker 镜像...$(NC)"
	docker build -t $(APP_NAME):$(VERSION) .
	@echo "$(GREEN)✓ 镜像构建完成: $(APP_NAME):$(VERSION)$(NC)"

## docker-run: 运行 Docker 容器
.PHONY: docker-run
docker-run:
	@echo "$(GREEN)启动 Docker 容器...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ 容器启动完成$(NC)"

## install-tools: 安装开发工具
.PHONY: install-tools
install-tools:
	@echo "$(GREEN)安装开发工具...$(NC)"
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "$(GREEN)✓ 工具安装完成$(NC)"

# 组合命令
## check: 运行所有检查（fmt, vet, test）
.PHONY: check
check: fmt vet test
	@echo "$(GREEN)✓ 所有检查通过$(NC)"

## all: 完整构建流程
.PHONY: all
all: clean init fmt vet build test
	@echo "$(GREEN)✓ 完整构建流程完成$(NC)"