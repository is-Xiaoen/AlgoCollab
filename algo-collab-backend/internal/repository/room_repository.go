package repository

import (
	"context"

	"github.com/is-Xiaoen/algo-collab/internal/models"
)

//var _ RoomRepository = (*roomRepositoryImpl)(nil)

type RoomRepository interface {
	Create(ctx context.Context, room *models.Room) error
	FindByID(ctx context.Context, id uint) (*models.Room, error)
	FindByUUID(ctx context.Context, uuid string) (*models.Room, error)
	FindActiveRooms(ctx context.Context, limit, offset int) ([]*models.Room, error)
	Update(ctx context.Context, room *models.Room) error
	Delete(ctx context.Context, id uint) error

	// 成员相关操作

	AddMember(ctx context.Context, member *models.RoomMember) error
	RemoveMember(ctx context.Context, roomID, userID uint) error
	GetMembers(ctx context.Context, roomID uint) ([]*models.RoomMember, error)
	GetMemberCount(ctx context.Context, roomID uint) (int64, error)
	IsMember(ctx context.Context, roomID, userID uint) (bool, error)
}

type roomRepositoryImpl struct {
}
