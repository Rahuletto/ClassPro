package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
	"strconv"
)

func GetTimetable(token string) (*types.TimetableResult, error) {
	scraper := helpers.NewTimetable(token)
	user, err := GetUser(token)
	if err != nil {
		return &types.TimetableResult{}, err
	}

	if user.Batch == "" {
		user.Batch = "1"
	}
	batchNum, err := strconv.Atoi(user.Batch)
	if err != nil {
		return &types.TimetableResult{}, err
	}

	timetable, err := scraper.GetTimetable(batchNum)

	return timetable, err
}
