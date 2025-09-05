package response

import (
	"github.com/gin-gonic/gin"
)

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
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

// ErrorWithData 带数据的错误响应
func ErrorWithData(c *gin.Context, httpCode int, bizCode int, message string, data interface{}) {
	c.JSON(httpCode, gin.H{
		"code":    bizCode,
		"message": message,
		"data":    data,
	})
}
