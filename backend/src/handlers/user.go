package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
)

func GetUser(token string) (*types.User, error) {
	scraper := helpers.NewCoursePage(token)
	page, err := scraper.GetPage()
	if err != nil {
		return &types.User{}, err
	}

	user, err := helpers.GetUser(page)

	return user, err

}
