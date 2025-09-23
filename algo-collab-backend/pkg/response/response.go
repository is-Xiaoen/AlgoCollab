package response

import (
	"github.com/gin-gonic/gin"
)

// Success 成功响应
func Success(c *gin.Context, message string, data interface{}) {
	c.JSON(200, gin.H{
		"code":    2000,
		"message": message,
		"data":    data,
	})
}

// SuccessWithCode 带自定义HTTP状态码的成功响应
func SuccessWithCode(c *gin.Context, httpCode int, message string, data interface{}) {
	c.JSON(httpCode, gin.H{
		"code":    2000,
		"message": message,
		"data":    data,
	})
}

// Error 错误响应
func Error(c *gin.Context, httpCode int, bizCode int, message string) {
	c.JSON(httpCode, gin.H{
		"code":    bizCode,
		"message": message,
		"data":    nil,
	})
}

// BadRequest 400错误
func BadRequest(c *gin.Context, message string) {
	c.JSON(400, gin.H{
		"code":    4001,
		"message": message,
		"data":    nil,
	})
}

// InternalError 500错误
func InternalError(c *gin.Context, message string) {
	c.JSON(500, gin.H{
		"code":    5001,
		"message": message,
		"data":    nil,
	})
}

// ErrorWithData 带数据的错误响应
func ErrorWithData(c *gin.Context, httpCode int, bizCode int, message string, data interface{}) {
	c.JSON(httpCode, gin.H{
		"code":    bizCode,
		"message": message,
		"data":    data,
	})
}

// Unauthorized 未授权
func Unauthorized(c *gin.Context, message string) {
	c.JSON(401, gin.H{
		"code":    401,
		"message": message,
		"data":    nil,
	})
}

// Forbidden 禁止访问
func Forbidden(c *gin.Context, message string) {
	c.JSON(403, gin.H{
		"code":    403,
		"message": message,
		"data":    nil,
	})
}
