package service

import (
	"context"
	"fmt"
	"testing"

	"github.com/is-Xiaoen/algo-collab/internal/config"
	"github.com/is-Xiaoen/algo-collab/internal/models"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// 初始化测试环境
func init() {
	// 初始化logger，使用开发环境配置
	logConfig := &config.LogConfig{
		Level:    "debug",
		Format:   "console",
		Output:   "stdout",
		FilePath: "",
	}
	if err := logger.Init(logConfig); err != nil {
		panic("初始化logger失败: " + err.Error())
	}
}

// MockUserRepository 模拟用户仓库
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) Update(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) ExistsByUsername(ctx context.Context, username string) (bool, error) {
	args := m.Called(ctx, username)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserRepository) FindByUUID(ctx context.Context, uuid string) (*models.User, error) {
	args := m.Called(ctx, uuid)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

// 实现 UserRepository 接口的方法
func (m *MockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	args := m.Called(ctx, email)
	return args.Bool(0), args.Error(1)
}

// 测试注册功能
func TestAuthService_Register(t *testing.T) {
	// 表格驱动测试
	tests := []struct {
		name      string                    // 测试用例名称
		req       *RegisterRequest          // 输入参数
		mockSetup func(*MockUserRepository) // Mock设置
		wantErr   bool                      // 期望是否出错
		errMsg    string                    // 期望的错误信息
	}{
		{
			name: "成功注册",
			req: &RegisterRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				// 设置Mock行为
				m.On("ExistsByEmail", mock.Anything, "test@example.com").Return(false, nil)
				m.On("ExistsByUsername", mock.Anything, "testuser").Return(false, nil)
				m.On("Create", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "邮箱已存在",
			req: &RegisterRequest{
				Username: "testuser",
				Email:    "exists@example.com",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				m.On("ExistsByEmail", mock.Anything, "exists@example.com").Return(true, nil)
			},
			wantErr: true,
			errMsg:  "邮箱已被注册",
		},
		{
			name: "用户名已存在",
			req: &RegisterRequest{
				Username: "existuser",
				Email:    "new@example.com",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				m.On("ExistsByEmail", mock.Anything, "new@example.com").Return(false, nil)
				m.On("ExistsByUsername", mock.Anything, "existuser").Return(true, nil)
			},
			wantErr: true,
			errMsg:  "用户名已被占用",
		},
		{
			name: "密码太弱",
			req: &RegisterRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "weak",
			},
			mockSetup: func(m *MockUserRepository) {
				// 不会调用任何repository方法，因为密码验证会先失败
			},
			wantErr: true,
			errMsg:  "密码长度至少8位",
		},
		{
			name: "邮箱格式错误",
			req: &RegisterRequest{
				Username: "testuser",
				Email:    "invalid-email",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				// 不会调用任何repository方法
			},
			wantErr: true,
			errMsg:  "邮箱格式不正确",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 1. 创建Mock对象
			mockRepo := new(MockUserRepository)
			tt.mockSetup(mockRepo)

			// 2. 创建被测试的服务
			service := NewAuthService(mockRepo, &config.JWTConfig{
				Secret:             "test-secret-key-for-testing",
				ExpireHours:        24,
				RefreshExpireHours: 24 * 7,
			})

			// 3. 执行测试
			resp, err := service.Register(context.Background(), tt.req)

			// 4. 断言结果
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.EqualError(t, err, tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.NotEmpty(t, resp.AccessToken)
			}

			// 5. 验证Mock调用
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestAuthService_Login(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("Test1234!"), bcrypt.DefaultCost)
	testUser := &models.User{
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: string(hashedPassword),
		Status:       "active",
		Role:         "user",
		UUID:         "test-uuid",
	}

	// 表格驱动测试
	tests := []struct {
		name      string                    // 测试用例名称
		req       *LoginRequest             // 输入参数
		mockSetup func(*MockUserRepository) // Mock设置
		wantErr   bool                      // 期望是否出错
		errMsg    string                    // 期望的错误信息
	}{
		{
			name: "成功登录",
			req: &LoginRequest{
				Email:    "test@example.com",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				// 设置Mock行为
				m.On("FindByEmail", mock.Anything, "test@example.com").Return(testUser, nil)
				m.On("Update", mock.Anything, testUser).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "用户不存在",
			req: &LoginRequest{
				Email:    "test1@example.com",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				// 设置Mock行为
				m.On("FindByEmail", mock.Anything, "test1@example.com").Return(nil, fmt.Errorf(""))
			},
			wantErr: true,
			errMsg:  "邮箱或密码错误",
		},
		{
			name: "密码错误",
			req: &LoginRequest{
				Email:    "test@example.com",
				Password: "WrongPassword123!",
			},
			mockSetup: func(m *MockUserRepository) {
				// 需要返回用户，但密码不匹配
				m.On("FindByEmail", mock.Anything, "test@example.com").Return(testUser, nil)
			},
			wantErr: true,
			errMsg:  "邮箱或密码错误",
		},
		{
			name: "账号被禁用",
			req: &LoginRequest{
				Email:    "test2@example.com",
				Password: "Test1234!",
			},
			mockSetup: func(m *MockUserRepository) {
				// 创建一个被禁用的用户
				disabledUser := &models.User{
					Username:     "disabled",
					Email:        "test2@example.com",
					PasswordHash: string(hashedPassword),
					Status:       "inactive", // 账号被禁用
					Role:         "user",
					UUID:         "disabled-uuid",
				}
				m.On("FindByEmail", mock.Anything, "test2@example.com").Return(disabledUser, nil)
			},
			wantErr: true,
			errMsg:  "账号已被禁用",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 1.创建Mock对象
			mockRepo := new(MockUserRepository)
			tt.mockSetup(mockRepo)

			// 2. 创建被测试的服务
			service := NewAuthService(mockRepo, &config.JWTConfig{
				Secret:             "test-secret-key-for-testing",
				ExpireHours:        24,
				RefreshExpireHours: 24 * 7,
			})

			// 3.执行测试
			resp, err := service.Login(context.Background(), tt.req)

			// 4. 断言结果
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.EqualError(t, err, tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.NotEmpty(t, resp.AccessToken)
			}

			// 5. 验证Mock调用
			mockRepo.AssertExpectations(t)
		})
	}
}
