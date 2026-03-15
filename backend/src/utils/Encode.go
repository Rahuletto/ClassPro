package utils

import (
	"encoding/base64"
	"fmt"
	"strconv"
)

func Encode(str string) string {
	hash := uint32(2166136261)

	for _, char := range str {
		hash ^= uint32(char)
		hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
	}

	return fmt.Sprintf("%d%x%s",
		hash,
		hash>>1,
		strconv.FormatInt(int64(hash>>2), 32),
	)
}

func DecodeBase64(str string) (string, error) {
	bytes, err := base64.StdEncoding.DecodeString(str)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}