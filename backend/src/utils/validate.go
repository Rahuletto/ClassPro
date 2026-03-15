package utils

import (
	"encoding/base64"
	"errors"
	"goscraper/src/globals"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	// "github.com/joho/godotenv"
)

func ValidateToken(token string) (*bool, error) {
	// err := godotenv.Load()
	validationKey := os.Getenv("VALIDATION_KEY")
	if validationKey == "" {
		log.Println("VALIDATION_KEY is not defined!")
		return nil, errors.New("validation_key is not defined")
	}

	decodedBytes, err := base64.StdEncoding.DecodeString(token)
	if err != nil {
		return nil, err
	}

	decodedData := string(decodedBytes)
	parts := strings.Split(decodedData, ".")
	if len(parts) != 2 {
		return nil, errors.New("malformed token")
	}

	timestamp, key := parts[0], parts[1]
	if key != validationKey {
		return nil, errors.New("invalid token")
	}

	tokenTime, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return nil, err
	}

	currentTime := time.Now().Unix()
	result := currentTime-tokenTime <= 180
	return &result, nil
}

func ValidateAuth(timestamp string, key string) (*bool, error) {
	if globals.DevMode {
		godotenv.Load()
	}
	validationKey := os.Getenv("VALIDATION_KEY")
	if validationKey == "" {
		log.Println("VALIDATION_KEY is not defined!")
		return nil, errors.New("validation_key is not defined")
	}

	tokenTime, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return nil, err
	}

	currentTime := time.Now().Unix()
	result := currentTime-tokenTime <= 180
	return &result, nil
}
