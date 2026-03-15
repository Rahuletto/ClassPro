package types

type MarksDetail struct {
	Scored string `json:"scored"`
	Total  string `json:"total"`
}

type TestPerformance struct {
	Test  string      `json:"test"`
	Marks MarksDetail `json:"marks"`
}

type Mark struct {
	CourseName      string            `json:"courseName"`
	CourseCode      string            `json:"courseCode"`
	CourseType      string            `json:"courseType"`
	Overall         MarksDetail       `json:"overall"`
	TestPerformance []TestPerformance `json:"testPerformance"`
}

type MarksResponse struct {
	RegNumber string `json:"regNumber"`
	Marks     []Mark `json:"marks"`
	Status    int    `json:"status"`
	Error     string `json:"error,omitempty"`
}
