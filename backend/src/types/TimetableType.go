package types

type Slot struct {
	Day      int      `json:"day"`
	DayOrder string   `json:"dayOrder"`
	Slots    []string `json:"slots"`
}

type Batch struct {
	Batch string `json:"batch"`
	Slots []Slot `json:"slots"`
}

type TableSlot struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	Slot       string `json:"slot"`
	RoomNo     string `json:"roomNo"`
	CourseType string `json:"courseType"`
	Online     bool   `json:"online"`
	IsOptional bool   `json:"isOptional"`
}

type DaySchedule struct {
	Day   int         `json:"day"`
	Table []interface{} `json:"table"`
}

type TimetableResult struct {
	RegNumber string        `json:"regNumber"`
	Batch     string        `json:"batch"`
	Schedule  []DaySchedule `json:"schedule"`
}
