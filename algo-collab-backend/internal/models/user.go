package models

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	BaseModel
	UUID         string     `gorm:"type:varchar(36);uniqueIndex;not null" json:"uuid"`
	Username     string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email        string     `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"-"`             // json:"-" 表示不返回给前端
	Avatar       string     `gorm:"type:varchar(500)" json:"avatar"`                 // 头像
	Bio          string     `gorm:"type:text" json:"bio"`                            // 个人简介
	Role         string     `gorm:"type:varchar(20);default:'user'" json:"role"`     // user, admin, moderator
	Status       string     `gorm:"type:varchar(20);default:'active'" json:"status"` // active, inactive, banned
	LastLoginAt  *time.Time `json:"last_login_at"`

	// 关联关系（后续添加）
	// Rooms []Room `gorm:"many2many:room_members;"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// BeforeCreate GORM 钩子：创建前执行
func (u *User) BeforeCreate(tx *gorm.DB) error {
	// 生成 UUID
	u.UUID = generateUUID()
	return nil
}

// generateUUID 生成UUID（简单实现，实际应该用 uuid 库）
func generateUUID() string {
	// TODO(human): 实现UUID生成
	return "temp-uuid"
}
