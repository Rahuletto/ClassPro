package types

type Attendance struct {
	CourseCode           string `json:"courseCode"`
	CourseTitle          string `json:"courseTitle"`
	Category             string `json:"category"`
	FacultyName          string `json:"facultyName"`
	Slot                 string `json:"slot"`
	HoursConducted       string `json:"hoursConducted"`
	HoursAbsent          string `json:"hoursAbsent"`
	AttendancePercentage string `json:"attendancePercentage"`
}

type AttendanceResponse struct {
	RegNumber  string       `json:"regNumber"`
	Attendance []Attendance `json:"attendance"`
	Status     int          `json:"status,omitempty"`
	Error      string       `json:"error,omitempty"`
}
