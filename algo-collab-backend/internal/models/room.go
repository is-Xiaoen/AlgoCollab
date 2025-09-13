package models

import "time"

// Room 房间模型
type Room struct {
	BaseModel
	UUID        string `gorm:"type:varchar(36);uniqueIndex;not null" json:"uuid"`
	Name        string `gorm:"type:varchar(100);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	CreatorID   uint   `json:"creator_id"`
	Language    string `gorm:"type:varchar(20);not null" json:"language"` // python, javascript, go, java
	MaxMembers  int    `gorm:"default:10" json:"max_members"`
	IsPublic    bool   `gorm:"default:true" json:"is_public"`
	Password    string `gorm:"type:varchar(255)" json:"-"`
	Status      string `gorm:"type:varchar(20);default:'active'" json:"status"`

	// 关联
	Creator User `gorm:"foreignKey:CreatorID" json:"creator"`
}

type RoomMember struct {
	BaseModel
	RoomID       uint      `json:"room_id" gorm:"not null"`
	UserID       uint      `json:"user_id" gorm:" not null"`
	Role         string    `json:"role" gorm:"size:20;default:'member'"` // owner/admin/member
	JoinedAt     time.Time `json:"joined_at" gorm:"autoCreateTime"`
	LastActiveAt time.Time `json:"last_active_at" gorm:"autoCreateTime"`

	// 关联
	Room  Room `json:"room" gorm:"foreignKey:RoomID"`
	Users User `json:"user" gorm:"foreignKey:UserID"`
}

func (Room) TableName() string {
	return "rooms"
}
