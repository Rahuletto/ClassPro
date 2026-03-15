package utils

import (
	"regexp"
)

func CompileRegex(pattern string) (*regexp.Regexp, error) {
	return regexp.Compile(pattern)
}
