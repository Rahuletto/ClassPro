package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
	"time"
)

func GetCalendar(token string) (*types.CalendarResponse, error) {
	scraper := helpers.NewCalendarFetcher(time.Now(), token)
	calendar, err := scraper.GetCalendar()

	return calendar, err

}
