package types

type Day struct {
	Date     string `json:"date"`
	Day      string `json:"day"`
	Event    string `json:"event"`
	DayOrder string `json:"dayOrder"`
}

type CalendarMonth struct {
	Month string `json:"month"`
	Days  []Day  `json:"days"`
}

type CalendarResponse struct {
	Error    bool            `json:"error"`
	Message  string          `json:"message,omitempty"`
	Status   int             `json:"status"`
	Today    *Day            `json:"today"`
	Tomorrow *Day            `json:"tomorrow"` // Add this line
	Index    int             `json:"index"`
	Calendar []CalendarMonth `json:"calendar"`
}
