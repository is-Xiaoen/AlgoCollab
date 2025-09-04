# ===========================
# AlgoCollab Makefile
# ===========================

# 变量定义
BINARY_NAME=algocollab
MAIN_PATH=./cmd/server
BUILD_DIR=./build
DOCKER_IMAGE=algocollab/backend
VERSION=$(shell git describe --tags --always --dirty)
BUILD_TIME=$(shell date +%FT%T%z)

# Go 相关变量
GO=go
GOFLAGS=-v
LDFLAGS=-ldflags "-X main.Version=${VERSION} -X main.BuildTime=${BUILD_TIME}"

# 颜色输出
GREEN=\033[0;32m
RED=\033[0;31m
YELLOW=\033[1;33m
NC=\033[0m # No Color

.PHONY: help
help: ## 显示帮助信息
	@echo "AlgoCollab Backend - 可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-20s${NC} %s\n", $$1, $$2}'

.PHONY: init
init: ## 初始化项目（下载依赖）
	@echo "${GREEN}初始化项目...${NC}"
	$(GO) mod download
	$(GO) mod tidy
	@echo "${GREEN}依赖安装完成！${NC}"

.PHONY: run
run: ## 运行应用（开发模式）
	@echo "${GREEN}启动应用...${NC}"
	$(GO) run $(MAIN_PATH)/main.go

.PHONY: build
build: ## 构建二进制文件
	@echo "${GREEN}构建应用...${NC}"
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "${GREEN}构建完成: $(BUILD_DIR)/$(BINARY_NAME)${NC}"

.PHONY: build-linux
build-linux: ## 构建 Linux 平台二进制文件
	@echo "${GREEN}构建 Linux 版本...${NC}"
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 $(GO) build $(GOFLAGS) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux $(MAIN_PATH)
	@echo "${GREEN}构建完成: $(BUILD_DIR)/$(BINARY_NAME)-linux${NC}"

.PHONY: build-windows
build-windows: ## 构建 Windows 平台二进制文件
	@echo "${GREEN}构建 Windows 版本...${NC}"
	@mkdir -p $(BUILD_DIR)
	GOOS=windows GOARCH=amd64 $(GO) build $(GOFLAGS) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME).exe $(MAIN_PATH)
	@echo "${GREEN}构建完成: $(BUILD_DIR)/$(BINARY_NAME).exe${NC}"

.PHONY: test
test: ## 运行测试
	@echo "${GREEN}运行测试...${NC}"
	$(GO) test -v -race -coverprofile=coverage.txt -covermode=atomic ./...
	@echo "${GREEN}测试完成！${NC}"

.PHONY: test-coverage
test-coverage: test ## 运行测试并生成覆盖率报告
	@echo "${GREEN}生成覆盖率报告...${NC}"
	$(GO) tool cover -html=coverage.txt -o coverage.html
	@echo "${GREEN}覆盖率报告已生成: coverage.html${NC}"

.PHONY: lint
lint: ## 运行代码检查
	@echo "${GREEN}运行代码检查...${NC}"
	@if ! which golangci-lint > /dev/null; then \
		echo "${YELLOW}安装 golangci-lint...${NC}"; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi
	golangci-lint run ./...
	@echo "${GREEN}代码检查完成！${NC}"

.PHONY: fmt
fmt: ## 格式化代码
	@echo "${GREEN}格式化代码...${NC}"
	$(GO) fmt ./...
	@echo "${GREEN}代码格式化完成！${NC}"

.PHONY: vet
vet: ## 运行 go vet
	@echo "${GREEN}运行 go vet...${NC}"
	$(GO) vet ./...
	@echo "${GREEN}vet 检查完成！${NC}"

.PHONY: clean
clean: ## 清理构建产物
	@echo "${GREEN}清理构建产物...${NC}"
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.txt coverage.html
	@echo "${GREEN}清理完成！${NC}"

.PHONY: docker-build
docker-build: ## 构建 Docker 镜像
	@echo "${GREEN}构建 Docker 镜像...${NC}"
	docker build -t $(DOCKER_IMAGE):$(VERSION) -t $(DOCKER_IMAGE):latest .
	@echo "${GREEN}Docker 镜像构建完成！${NC}"

.PHONY: docker-push
docker-push: ## 推送 Docker 镜像
	@echo "${GREEN}推送 Docker 镜像...${NC}"
	docker push $(DOCKER_IMAGE):$(VERSION)
	docker push $(DOCKER_IMAGE):latest
	@echo "${GREEN}Docker 镜像推送完成！${NC}"

.PHONY: docker-up
docker-up: ## 启动 Docker Compose 服务
	@echo "${GREEN}启动 Docker Compose 服务...${NC}"
	docker-compose up -d
	@echo "${GREEN}服务启动完成！${NC}"

.PHONY: docker-down
docker-down: ## 停止 Docker Compose 服务
	@echo "${GREEN}停止 Docker Compose 服务...${NC}"
	docker-compose down
	@echo "${GREEN}服务已停止！${NC}"

.PHONY: docker-logs
docker-logs: ## 查看 Docker Compose 日志
	docker-compose logs -f

.PHONY: migrate-up
migrate-up: ## 执行数据库迁移
	@echo "${GREEN}执行数据库迁移...${NC}"
	migrate -path ./migrations -database "postgresql://algocollab_user:dev_password_123@localhost:5432/algocollab?sslmode=disable" up
	@echo "${GREEN}数据库迁移完成！${NC}"

.PHONY: migrate-down
migrate-down: ## 回滚数据库迁移
	@echo "${RED}回滚数据库迁移...${NC}"
	migrate -path ./migrations -database "postgresql://algocollab_user:dev_password_123@localhost:5432/algocollab?sslmode=disable" down 1
	@echo "${GREEN}数据库回滚完成！${NC}"

.PHONY: swagger
swagger: ## 生成 Swagger 文档
	@echo "${GREEN}生成 Swagger 文档...${NC}"
	@if ! which swag > /dev/null; then \
		echo "${YELLOW}安装 swag...${NC}"; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	swag init -g $(MAIN_PATH)/main.go -o ./docs/swagger
	@echo "${GREEN}Swagger 文档生成完成！${NC}"

.PHONY: install-tools
install-tools: ## 安装开发工具
	@echo "${GREEN}安装开发工具...${NC}"
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	go install github.com/air-verse/air@latest
	@echo "${GREEN}开发工具安装完成！${NC}"

.PHONY: dev
dev: ## 使用 Air 热重载运行（开发模式）
	@echo "${GREEN}启动热重载开发模式...${NC}"
	@if ! which air > /dev/null; then \
		echo "${YELLOW}安装 Air...${NC}"; \
		go install github.com/air-verse/air@latest; \
	fi
	air -c .air.toml

.PHONY: proto
proto: ## 编译 Protocol Buffers（如果使用 gRPC）
	@echo "${GREEN}编译 Protocol Buffers...${NC}"
	protoc --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		./api/proto/*.proto
	@echo "${GREEN}Proto 编译完成！${NC}"

.PHONY: all
all: clean fmt vet lint test build ## 执行所有构建步骤

.DEFAULT_GOAL := help