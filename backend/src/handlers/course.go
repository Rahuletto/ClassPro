package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
)

func GetCourses(token string) (*types.CourseResponse, error) {
	scraper := helpers.NewCoursePage(token)
	course, err := scraper.GetCourses()

	return course, err
}
