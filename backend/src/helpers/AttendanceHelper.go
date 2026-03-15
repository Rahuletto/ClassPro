package helpers

import (
	"errors"
	"fmt"
	"goscraper/src/types"
	"goscraper/src/utils"
	"log"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/valyala/fasthttp"
)

type AcademicsFetch struct {
	cookie string
}

func NewAcademicsFetch(cookie string) *AcademicsFetch {
	return &AcademicsFetch{
		cookie: cookie,
	}
}

func (a *AcademicsFetch) getHTML() (string, error) {

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI("https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance")
	req.Header.SetMethod("GET")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/")
	req.Header.Set("Sec-Fetch-Dest", "empty")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("Sec-Fetch-Site", "same-origin")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")
	req.Header.Set("dnt", "1")
	req.Header.Set("sec-ch-ua", `"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"`)
	req.Header.Set("sec-ch-ua-mobile", "?0")
	req.Header.Set("sec-ch-ua-platform", `"macOS"`)
	req.Header.Set("sec-gpc", "1")
	req.Header.Set("cookie", a.cookie)

	if err := fasthttp.Do(req, resp); err != nil {
		return "", fmt.Errorf("failed to fetch HTML: %v", err)
	}

	if resp.StatusCode() != fasthttp.StatusOK {
		return "", fmt.Errorf("server returned status %d", resp.StatusCode())
	}

	data := string(resp.Body())
	parts := strings.Split(data, ".sanitize('")
	if len(parts) < 2 {
		return "", errors.New("attendance - invalid response format")
	}

	htmlHex := strings.Split(parts[1], "')")[0]
	return utils.ConvertHexToHTML(htmlHex), nil
}

func (a *AcademicsFetch) GetAttendance() (*types.AttendanceResponse, error) {

	html, err := a.getHTML()
	if err != nil {
		log.Printf("AttendanceHelper.GetAttendance: failed to fetch attendance - %v", err)
		return &types.AttendanceResponse{
			Status:     500,
			Error:      err.Error(),
			Attendance: []types.Attendance{},
		}, nil
	}

	result, err := a.ScrapeAttendance(html)
	if err != nil {
		log.Printf("AttendanceHelper.GetAttendance: failed to scrape attendance - %v", err)
		return &types.AttendanceResponse{
			Status:     500,
			Error:      err.Error(),
			Attendance: []types.Attendance{},
		}, nil
	}

	return result, nil
}

func (a *AcademicsFetch) GetMarks() (*types.MarksResponse, error) {

	html, err := a.getHTML()
	if err != nil {
		log.Printf("AttendanceHelper.GetMarks: failed to fetch marks - %v", err)
		return &types.MarksResponse{
			Status: 500,
			Error:  err.Error(),
			Marks:  []types.Mark{},
		}, nil
	}

	result, err := a.ScrapeMarks(html)
	if err != nil {
		log.Printf("AttendanceHelper.GetMarks: failed to scrape marks - %v", err)
		return &types.MarksResponse{
			Status: 500,
			Error:  err.Error(),
			Marks:  []types.Mark{},
		}, nil
	}

	return result, nil
}

func (a *AcademicsFetch) ScrapeAttendance(html string) (*types.AttendanceResponse, error) {
	re := regexp.MustCompile(`RA2\d{12}`)
	regNumber := re.FindString(html)
	html = strings.ReplaceAll(html, "<td  bgcolor='#E6E6FA' style='text-align:center'> - </td>", "")
	html = strings.Split(html, `<table style="font-size :16px;" border="1" align="center" cellpadding="1" cellspacing="1" bgcolor="#FAFAD2">`)[1]
	html = strings.Split(html, "</table>")[0]

	html = `<table style="font-size :16px;" border="1" align="center" cellpadding="1" cellspacing="1" bgcolor="#FAFAD2">` + html + "</table>"

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		log.Printf("AttendanceHelper.ScrapeAttendance: failed to parse HTML - %v", err)
		return &types.AttendanceResponse{
			RegNumber:  regNumber,
			Attendance: []types.Attendance{},
		}, nil
	}

	rows := doc.Find("td[bgcolor='#E6E6FA']").FilterFunction(func(i int, s *goquery.Selection) bool {
		return s.Text() != " - "
	})

	if rows.Length() == 0 {
		// fmt.Println("No attendance data found")
		return &types.AttendanceResponse{RegNumber: regNumber, Attendance: []types.Attendance{}}, nil
	}

	var attendances []types.Attendance
	rows.Each(func(i int, s *goquery.Selection) {

		courseCode := s.Text()
		if matched, _ := regexp.MatchString(`^\d.*`, courseCode); len(courseCode) > 10 && matched || strings.Contains(strings.ToLower(courseCode), "regular") {
			conducted := s.NextAll().Eq(5).Text()
			absent := s.NextAll().Eq(6).Text()

			conductedNum := utils.ParseFloat(conducted)
			absentNum := utils.ParseFloat(absent)
			percentage := 0.0
			if conductedNum != 0 {
				percentage = ((conductedNum - absentNum) / conductedNum) * 100
			}

			attendance := types.Attendance{
				CourseCode:           strings.Replace(s.Text(), "Regular", "", -1),
				CourseTitle:          strings.Split(s.NextAll().Eq(0).Text(), " \\u2013")[0],
				Category:             s.NextAll().Eq(1).Text(),
				FacultyName:          s.NextAll().Eq(2).Text(),
				Slot:                 s.NextAll().Eq(3).Text(),
				HoursConducted:       conducted,
				HoursAbsent:          absent,
				AttendancePercentage: fmt.Sprintf("%.2f", percentage),
			}

			if strings.ToLower(attendance.CourseTitle) != "null" {
				attendances = append(attendances, attendance)
			}
		}
	})

	return &types.AttendanceResponse{
		RegNumber:  regNumber,
		Attendance: attendances,
		Status:     200,
	}, nil
}

func (a *AcademicsFetch) ScrapeMarks(html string) (*types.MarksResponse, error) {

	attResp, err := a.ScrapeAttendance(html)
	if err != nil {
		log.Printf("AttendanceHelper.ScrapeMarks: failed to get attendance for course mapping - %v", err)
		return &types.MarksResponse{
			RegNumber: "",
			Marks:     []types.Mark{},
			Status:    200,
		}, nil
	}

	courseMap := make(map[string]string)
	for _, att := range attResp.Attendance {
		courseMap[att.CourseCode] = att.CourseTitle
	}

	var marks []types.Mark
	html = strings.Split(html, `<table border="1" align="center" cellpadding="1" cellspacing="1">`)[1]
	html = strings.Split(html, `<table  width=800px;"border="0"cellspacing="1"cellpadding="1">`)[0]
	html = strings.Split(html, `<br />`)[0]

	html = `<table border="1" align="center" cellpadding="1" cellspacing="1">` + html

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %v", err)
	}

	html, _ = doc.Html()
	html = strings.ReplaceAll(html, `<table style="font-size" :6;="" border="2" cellpadding="1" cellspacing="1"><tbody><tr><td>`, "")
	html = strings.ReplaceAll(html, `</td></tr>`, "")
	rowsTables := strings.Split(html, `</table></td>`)
	if len(rowsTables) == 0 {
		return &types.MarksResponse{
			RegNumber: attResp.RegNumber,
			Marks:     []types.Mark{},
			Status:    200,
		}, nil
	}

	htmlTables := make([]*goquery.Document, len(rowsTables))
	for i, table := range rowsTables {
		htmlTables[i], _ = goquery.NewDocumentFromReader(strings.NewReader(table))
	}

	for _, table := range htmlTables {
		table.Find("tr").Each(func(i int, row *goquery.Selection) {

			cells := row.Find("td")
			courseCode := strings.TrimSpace(cells.Eq(0).Text())
			courseType := strings.TrimSpace(cells.Eq(1).Text())

			var testPerformance []types.TestPerformance
			var overallScored, overallTotal float64

			cells.Eq(2).Find("table td").Each(func(i int, testCell *goquery.Selection) {
				testText := strings.Split(strings.TrimSpace(testCell.Text()), ".00")

				if len(testText) >= 2 {
					testNameParts := strings.Split(testText[0], "/")
					testTitle := testNameParts[0]
					total := utils.ParseFloat(testNameParts[1])
					scored := utils.ParseFloat(testText[1])

					testPerformance = append(testPerformance, types.TestPerformance{
						Test: testTitle,
						Marks: types.MarksDetail{
							Scored: func() string {
								if testText[1] == "Abs" {
									return "Abs"
								}
								return fmt.Sprintf("%.2f", scored)
							}(),
							Total: fmt.Sprintf("%.2f", total),
						},
					})

					overallScored += scored
					overallTotal += total
				}
			})

			mark := types.Mark{
				CourseName: courseMap[courseCode],
				CourseCode: courseCode,
				CourseType: courseType,
				Overall: types.MarksDetail{
					Scored: fmt.Sprintf("%.2f", overallScored),
					Total:  fmt.Sprintf("%.2f", overallTotal),
				},
				TestPerformance: testPerformance,
			}

			marks = append(marks, mark)
		})
	}

	var sortedMarks []types.Mark
	for _, mark := range marks {
		if mark.CourseType == "Theory" {
			sortedMarks = append(sortedMarks, mark)
		}
	}
	for _, mark := range marks {
		if mark.CourseType == "Practical" {
			sortedMarks = append(sortedMarks, mark)
		}
	}

	return &types.MarksResponse{
		RegNumber: attResp.RegNumber,
		Marks:     sortedMarks,
		Status:    200,
	}, nil
}
