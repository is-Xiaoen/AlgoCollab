package models

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

func (Room) TableName() string {
	return "rooms"
}
