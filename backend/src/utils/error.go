package utils

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func HandleError(c *fiber.Ctx, err error) error {
	fmt.Println("Error handling: ", err)
	if err != nil && (strings.Contains(err.Error(), "invalid response format") ||
		strings.Contains(err.Error(), "invalid token format")) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"tokenInvalid": true,
			"error":        "Session expired or invalid",
			"status":       fiber.StatusUnauthorized,
		})
	}
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		"error":  err.Error(),
		"status": fiber.StatusInternalServerError,
	})
}
