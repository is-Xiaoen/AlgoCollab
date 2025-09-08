package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/is-Xiaoen/algo-collab/internal/database"
	"github.com/is-Xiaoen/algo-collab/pkg/logger"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/is-Xiaoen/algo-collab/internal/config"
	"github.com/is-Xiaoen/algo-collab/internal/models"
	"github.com/is-Xiaoen/algo-collab/internal/repository"
)

type AuthService interface {
	Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error)
	Logout(ctx context.Context, token string) error
	ValidateToken(token string) (*Claims, error)
	BlacklistToken(ctx context.Context, JTI string, expiration time.Duration) error
}

type authService struct {
	userRepo repository.UserRepository
	cfg      *config.JWTConfig
}

// 请求/响应结构体

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int64        `json:"expires_in"`
	User         *models.User `json:"user"`
}

// Claims JWT Claims
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService(userRepo repository.UserRepository, cfg *config.JWTConfig) AuthService {
	return &authService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

// 预编译正则表达式，避免每次校验都重新编译，大大提高性能
// regexp.MustCompile 会在编译失败时 panic，这在初始化阶段是合理的，因为正则表达式是固定的
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// IsValidEmailOptimized 使用预编译的正则表达式进行校验
func IsValidEmailOptimized(email string) bool {
	return emailRegex.MatchString(email)
}

// validatePassword 验证密码强度
func validatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("密码长度至少8位")
	}

	var hasUpper, hasLower, hasDigit bool
	for _, char := range password {
		switch {
		case 'A' <= char && char <= 'Z':
			hasUpper = true
		case 'a' <= char && char <= 'z':
			hasLower = true
		case '0' <= char && char <= '9':
			hasDigit = true
		}
	}

	if !hasUpper || !hasLower || !hasDigit {
		return errors.New("密码必须包含大小写字母和数字")
	}
	return nil
}

// Register 用户注册
func (s *authService) Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	// 1. 验证邮箱格式
	if !IsValidEmailOptimized(req.Email) {
		return nil, errors.New("邮箱格式不正确")
	}

	// 2. 验证密码强度
	if err := validatePassword(req.Password); err != nil {
		return nil, err
	}

	// 3. 检查邮箱是否已存在
	exists, err := s.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		logger.Error("检查邮箱失败", zap.Error(err))
		return nil, errors.New("注册失败，请稍后重试")
	}
	if exists {
		return nil, errors.New("邮箱已被注册")
	}

	// 4. 检查用户名是否已存在
	exists, err = s.userRepo.ExistsByUsername(ctx, req.Username)
	if err != nil {
		logger.Error("检查用户名失败", zap.Error(err))
		return nil, errors.New("注册失败，请稍后重试")
	}
	if exists {
		return nil, errors.New("用户名已被占用")
	}

	// 5. 密码加密
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 4. 创建用户
	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         "user",
		Status:       "active",
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// 5. 生成 Token
	return s.generateTokens(user)
}

// Login 用户登录
func (s *authService) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	// 1. 查找用户
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		logger.Warn("用户登录失败：用户不存在",
			zap.String("email", req.Email))
		return nil, errors.New("邮箱或密码错误")
	}

	// 2. 验证密码
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	); err != nil {
		logger.Warn("用户登录失败：密码错误",
			zap.String("email", req.Email))
		return nil, errors.New("邮箱或密码错误")
	}

	// 3. 检查用户状态
	if user.Status != "active" {
		return nil, errors.New("账号已被禁用")
	}

	// 4. 更新最后登录时间
	now := time.Now()
	user.LastLoginAt = &now
	s.userRepo.Update(ctx, user)

	// 5. 生成 Token
	return s.generateTokens(user)
}

// generateTokens 生成 Access Token 和 Refresh Token
func (s *authService) generateTokens(user *models.User) (*AuthResponse, error) {
	// 生成 Access Token
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	// 生成 Refresh Token
	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.cfg.ExpireHours * 3600),
		User:         user,
	}, nil
}

// generateAccessToken 生成访问令牌
func (s *authService) generateAccessToken(user *models.User) (string, error) {
	now := time.Now()
	expiresAt := now.Add(time.Duration(s.cfg.ExpireHours) * time.Hour)

	claims := Claims{
		UserID:   user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "AlgoCollab",
			Subject:   user.UUID,
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.Secret))
}

// generateRefreshToken 生成刷新令牌
func (s *authService) generateRefreshToken(user *models.User) (string, error) {
	now := time.Now()
	expiresAt := now.Add(time.Duration(s.cfg.RefreshExpireHours) * time.Hour)

	claims := jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expiresAt),
		IssuedAt:  jwt.NewNumericDate(now),
		Subject:   user.UUID,
		ID:        uuid.New().String(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.Secret))
}

// ValidateToken 验证 Token
func (s *authService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证签名方法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.cfg.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshToken 刷新token
func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error) {

	// 1. 解析并验证 refresh token
	// 注意：refresh token 使用 RegisteredClaims，不是 Claims
	token, err := jwt.ParseWithClaims(refreshToken, &jwt.RegisteredClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(s.cfg.Secret), nil
		})

	if err != nil {
		return nil, fmt.Errorf("无效的刷新令牌: %w", err)
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return nil, errors.New("无效的令牌格式")
	}

	// 2.检查 Token 是否在黑名单中
	blacklistKey := fmt.Sprintf("jwt:blacklist:%s", claims.ID)
	exists, err := database.Exists(ctx, blacklistKey)
	if err != nil {
		logger.Error("检查黑名单失败", zap.Error(err))
		return nil, err
	}
	if exists {
		return nil, errors.New("令牌已被撤销")
	}

	// 3.根据 Subject（用户UUID）查找用户
	user, err := s.userRepo.FindByUUID(ctx, claims.Subject)
	if err != nil {
		logger.Warn("用户不存在", zap.String("uuid", claims.Subject))
		return nil, errors.New("用户不存在")
	}

	// 4. 检查用户状态
	if user.Status != "active" {
		return nil, errors.New("账号已被禁用")
	}

	// 5. 生成新的 access token
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("生成新的访问令牌失败: %w", err)
	}

	logger.Info("Token 刷新成功",
		zap.String("user_uuid", user.UUID),
		zap.String("username", user.Username),
	)

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken, // 返回原来的 refresh token
		ExpiresIn:    int64(s.cfg.ExpireHours * 3600),
		User:         user,
	}, nil
}

// Logout 退出登录
func (s *authService) Logout(ctx context.Context, token string) error {
	// 第一步：解析 Token 获取信息
	parsedToken, err := jwt.ParseWithClaims(token, &Claims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(s.cfg.Secret), nil
		})

	if err != nil {
		// Token 可能已经过期或无效，但登出操作应该总是成功
		logger.Warn("解析 token 失败，但继续登出流程", zap.Error(err))
		return nil
	}

	claims, ok := parsedToken.Claims.(*Claims)
	if !ok {
		return nil
	}
	// 第二步：计算 Token 剩余有效时间
	// 为什么？黑名单记录只需要保存到 Token 自然过期
	var expiration time.Duration
	if claims.ExpiresAt != nil {
		// 计算从现在到过期时间的时长
		expiration = time.Until(claims.ExpiresAt.Time)
		if expiration < 0 {
			// Token 已经过期，不需要加入黑名单
			return nil
		}
	}

	// 第三步：将 Token 的 JTI 加入黑名单
	// JTI (JWT ID) 是 Token 的唯一标识符
	err = s.BlacklistToken(ctx, claims.ID, expiration)
	if err != nil {
		return err
	}

	logger.Info("用户登出成功",
		zap.Uint("user_id", claims.UserID),
		zap.String("username", claims.Username),
		zap.String("jti", claims.ID),
	)

	return nil
}

// BlacklistToken ：将Token JTI加入Redis黑名单
func (s *authService) BlacklistToken(ctx context.Context, JTI string, expiration time.Duration) error {
	blacklistKey := fmt.Sprintf("jwt:blacklist:%s", JTI)

	// 使用 Redis 的 SET 命令，同时设置过期时间
	err := database.SetWithExpiration(ctx, blacklistKey, "1", expiration)
	if err != nil {
		logger.Error("添加黑名单失败",
			zap.String("jti", JTI),
			zap.Error(err),
		)
		return err
	}
	return nil
}
