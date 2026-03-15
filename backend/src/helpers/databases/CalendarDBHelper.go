package databases

import (
	"goscraper/src/globals"
	"goscraper/src/helpers"
	"goscraper/src/types"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type DBResponse struct {
	CreatedAt int64  `json:"created_at"`
	Date      string `json:"date"`
	Day       string `json:"day"`
	Event     string `json:"event"`
	ID        int64  `json:"id"`
	Month     string `json:"month"`
	Order     string `json:"order"`
}
type CalendarDatabaseHelper struct {
	client *supabase.Client
}

func NewCalDBHelper() (*CalendarDatabaseHelper, error) {
	if globals.DevMode {
		godotenv.Load()
	}
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	client, err := supabase.NewClient(supabaseUrl, supabaseKey, nil)
	if err != nil {
		return nil, err
	}

	return &CalendarDatabaseHelper{
		client: client,
	}, nil
}

type CalendarEvent struct {
	ID        string `json:"id"`
	Date      string `json:"date"`
	Day       string `json:"day"`
	Month     string `json:"month"`
	Order     string `json:"order"`
	Event     string `json:"event"`
	CreatedAt int64  `json:"created_at"`
}

func (h *CalendarDatabaseHelper) SetEvent(event CalendarEvent) error {
	_, _, err := h.client.From("gocal").Insert(event, false, "", "", "").Execute()
	return err
}

func (h *CalendarDatabaseHelper) GetEvents() (types.CalendarResponse, error) {
	var events []DBResponse
	_, err := h.client.From("gocal").Select("*", "", false).ExecuteTo(&events)
	if err != nil {
		return types.CalendarResponse{}, err
	}

	if len(events) == 0 {
		return types.CalendarResponse{}, nil
	}

	var response []types.CalendarMonth = make([]types.CalendarMonth, 0)
	monthMap := make(map[string]*types.CalendarMonth)

	for _, event := range events {
		if month, exists := monthMap[event.Month]; exists {
			month.Days = append(month.Days, types.Day{
				Date:     event.Date,
				Day:      event.Day,
				Event:    event.Event,
				DayOrder: event.Order,
			})
		} else {
			newMonth := &types.CalendarMonth{
				Month: event.Month,
				Days: []types.Day{{
					Date:     event.Date,
					Day:      event.Day,
					Event:    event.Event,
					DayOrder: event.Order,
				}},
			}
			monthMap[event.Month] = newMonth
		}
	}

	for _, month := range monthMap {
		response = append(response, *month)
	}

	sortedData := helpers.SortCalendarData(response)

	monthNames := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
	date := time.Now()
	currentMonthName := monthNames[date.Month()-1]

	var monthEntry types.CalendarMonth
	var monthIndex int
	for i, entry := range sortedData {
		if strings.Contains(entry.Month, currentMonthName) {
			monthEntry = entry
			monthIndex = i
			break
		}
	}

	if monthEntry.Month == "" {
		monthEntry = sortedData[0]
		monthIndex = 0
	}

	var today, tomorrow *types.Day
	if len(monthEntry.Days) > 0 {
		todayIndex := time.Now().Day() - 1
		if todayIndex >= 0 && todayIndex < len(monthEntry.Days) {
			today = &monthEntry.Days[todayIndex]

			// Get tomorrow's date
			tomorrowIndex := todayIndex + 1
			if tomorrowIndex < len(monthEntry.Days) {
				tomorrow = &monthEntry.Days[tomorrowIndex]
			} else if monthIndex+1 < len(sortedData) && len(sortedData[monthIndex+1].Days) > 0 {
				// If tomorrow is in the next month
				tomorrow = &sortedData[monthIndex+1].Days[0]
			}
		}
	}

	resp := types.CalendarResponse{
		Today:    today,
		Tomorrow: tomorrow,
		Index:    monthIndex,
		Calendar: sortedData,
		Status:   200,
		Message:  "From DB",
	}

	return resp, nil
}
