package utils

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

func ConvertHexToHTML(hexString string) string {
	if hexString == "" {
		return ""
	}

	re := regexp.MustCompile(`\\x([0-9A-Fa-f]{2})`)
	return re.ReplaceAllStringFunc(hexString, func(match string) string {
		hex := match[2:] // Remove \x prefix
		if val, err := strconv.ParseInt(hex, 16, 32); err == nil {
			return string(rune(val))
		}
		return match
	})
}

func DecodeHTMLEntities(encodedString string) string {
	if encodedString == "" {
		return ""
	}

	// HTML entity mapping
	htmlEntities := map[string]string{
		"lt":   "<",
		"gt":   ">",
		"amp":  "&",
		"quot": "\"",
		"apos": "'",
	}

	re := regexp.MustCompile(`&#(\d+);|&#[xX]([A-Fa-f0-9]+);|&([^;]+);`)
	return re.ReplaceAllStringFunc(encodedString, func(match string) string {
		if strings.HasPrefix(match, "&#x") || strings.HasPrefix(match, "&#X") {
			// Hexadecimal entity
			hex := match[3 : len(match)-1]
			if val, err := strconv.ParseInt(hex, 16, 32); err == nil {
				return string(rune(val))
			}
		} else if strings.HasPrefix(match, "&#") {
			// Decimal entity
			dec := match[2 : len(match)-1]
			if val, err := strconv.ParseInt(dec, 10, 32); err == nil {
				return string(rune(val))
			}
		} else {
			// Named entity
			entity := match[1 : len(match)-1]
			if val, ok := htmlEntities[entity]; ok {
				return val
			}
		}
		return match
	})
}

func DecodeEscapeCharacters(input string) string {
	if input == "" {
		return ""
	}
	escapeMap := map[string]string{
		"\n": "",
		"\r": "",
		"\t": "",
		"\"": "",
		"'":  "",
		"\\": "",
	}

	result := input
	for escaped, literal := range escapeMap {
		result = strings.ReplaceAll(result, escaped, literal)
	}
	return result
}

func ExtractCookies(cookieStr string) string {
	iamadt := GetCookie(cookieStr, "_iamadt_client_10002227248")
	iambdt := GetCookie(cookieStr, "_iambdt_client_10002227248")
	return fmt.Sprintf("_iamadt_client_10002227248=%s; _iambdt_client_10002227248=%s;", iamadt, iambdt)
}

func GetCookie(cookieStr, name string) string {
	re := regexp.MustCompile(name + `=([^;]+)`)
	matches := re.FindStringSubmatch(cookieStr)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}
