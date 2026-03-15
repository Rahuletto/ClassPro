package handlers

import (
	"fmt"
	"goscraper/src/helpers"
	"goscraper/src/types"
)

func GetMarks(token string) (*types.MarksResponse, error) {
	scraper := helpers.NewAcademicsFetch(token)
	marks, err := scraper.GetMarks()
	fmt.Println(marks)

	return marks, err

}
