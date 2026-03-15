package types

type Course struct {
	Code           string `json:"code"`
	Title          string `json:"title"`
	Credit         string `json:"credit"`
	Category       string `json:"category"`
	CourseCategory string `json:"courseCategory"`
	Type           string `json:"type"`
	SlotType       string `json:"slotType"`
	Faculty        string `json:"faculty"`
	Slot           string `json:"slot"`
	Room           string `json:"room"`
	AcademicYear   string `json:"academicYear"`
}

type CourseResponse struct {
	RegNumber string   `json:"regNumber"`
	Courses   []Course `json:"courses"`
	Status    int      `json:"status,omitempty"`
	Error     string   `json:"error,omitempty"`
}
