package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper" // 配置管理库
)

// Config 主配置结构体
// 这个结构体的字段需要与 YAML 文件对应
type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Log      LogConfig      `mapstructure:"log"`
	CORS     CORSConfig     `mapstructure:"cors"`
}

// AppConfig 应用配置
type AppConfig struct {
	Name  string `mapstructure:"name"`
	Env   string `mapstructure:"env"`
	Port  string `mapstructure:"port"`
	Debug bool   `mapstructure:"debug"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Driver          string `mapstructure:"driver"`
	Host            string `mapstructure:"host"`
	Port            int    `mapstructure:"port"`
	Username        string `mapstructure:"username"`
	Password        string `mapstructure:"password"`
	Database        string `mapstructure:"database"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	ConnMaxLifetime int    `mapstructure:"conn_max_lifetime"`
}

// RedisConfig Redis配置
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

// JWTConfig JWT配置
type JWTConfig struct {
	Secret             string `mapstructure:"secret"`
	ExpireHours        int    `mapstructure:"expire_hours"`
	RefreshExpireHours int    `mapstructure:"refresh_expire_hours"`
}

// LogConfig 日志配置
type LogConfig struct {
	Level    string `mapstructure:"level"`
	Format   string `mapstructure:"format"`
	Output   string `mapstructure:"output"`
	FilePath string `mapstructure:"file_path"`
}

// CORSConfig 跨域配置
type CORSConfig struct {
	AllowOrigins     []string `mapstructure:"allow_origins"`
	AllowMethods     []string `mapstructure:"allow_methods"`
	AllowHeaders     []string `mapstructure:"allow_headers"`
	ExposeHeaders    []string `mapstructure:"expose_headers"`
	AllowCredentials bool     `mapstructure:"allow_credentials"`
	MaxAge           int      `mapstructure:"max_age"`
}

// 全局配置变量
var GlobalConfig *Config

// Load 加载配置文件
func Load(configPath string) error {
	// 1. 创建 viper 实例
	v := viper.New()

	// 2. 设置配置文件路径和类型
	v.SetConfigFile(configPath)
	v.SetConfigType("yaml")

	// 设置环境变量前缀
	v.SetEnvPrefix("ALGOCOLLAB")                       // 环境变量前缀
	v.AutomaticEnv()                                   // 自动读取环境变量
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_")) // 将.替换为_

	// 3. 读取配置文件
	if err := v.ReadInConfig(); err != nil {
		return fmt.Errorf("读取配置文件失败: %w", err)
	}

	// 4. 解析到结构体
	if err := v.Unmarshal(&GlobalConfig); err != nil {
		return fmt.Errorf("解析配置失败: %w", err)
	}
	return nil
}
