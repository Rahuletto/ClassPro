package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
)

func GetAttendance(token string) (*types.AttendanceResponse, error) {
	scraper := helpers.NewAcademicsFetch(token)
	attendance, err := scraper.GetAttendance()

	return attendance, err

}
