package types

type User struct {
	Name       string `json:"name"`
	Mobile     string `json:"mobile"`
	Program    string `json:"program"`
	Semester   int    `json:"semester"`
	RegNumber  string `json:"regNumber"`
	Batch      string `json:"batch"`
	Year       int    `json:"year"`
	Department string `json:"department"`
	Section    string `json:"section"`
	Specialization string `json:"specialization"`
}
