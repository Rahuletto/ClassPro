package helpers

import (
	"fmt"
	"goscraper/src/types"
	"goscraper/src/utils"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/valyala/fasthttp"
)

type CoursePage struct {
	cookie string
}

func NewCoursePage(cookie string) *CoursePage {
	return &CoursePage{
		cookie: cookie,
	}
}

func (c *CoursePage) getUrl() string {
	return "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24"
}

func (c *CoursePage) GetPage() (string, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	url := c.getUrl()
	req.SetRequestURI(url)
	req.Header.SetMethod("GET")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("cookie", c.cookie)
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

	if err := fasthttp.Do(req, resp); err != nil {
		return "", fmt.Errorf("failed to fetch page: %v", err)
	}

	if resp.StatusCode() != fasthttp.StatusOK {
		return "", fmt.Errorf("server returned status %d", resp.StatusCode())
	}

	data := string(resp.Body())
	parts := strings.Split(data, ".sanitize('")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid response format")
	}

	htmlHex := strings.Split(parts[1], "')")[0]
	return utils.ConvertHexToHTML(htmlHex), nil
}

func (c *CoursePage) GetCourses() (*types.CourseResponse, error) {
	page, err := c.GetPage()

	if err != nil {
		log.Printf("CourseHelper.GetCourses: failed to fetch courses - %v", err)
		return &types.CourseResponse{
			Status:  500,
			Error:   err.Error(),
			Courses: []types.Course{},
		}, nil
	}

	re := regexp.MustCompile(`RA2\d{12}`)
	regNumber := re.FindString(page)

	htmlParts := strings.Split(page, `<table cellspacing="1" cellpadding="1" border="1" align="center" style="width:900px!important;" class="course_tbl">`)
	if len(htmlParts) < 2 {
		log.Printf("CourseHelper.GetCourses: failed to find course table in the page")
		return &types.CourseResponse{
			Status:  500,
			Error:   "failed to find course table in the page",
			Courses: []types.Course{},
		}, nil
	}
	html := htmlParts[1]
	html = strings.Split(html, "</table>")[0]

	html = `<table style="font-size :16px;" border="1" align="center" cellpadding="1" cellspacing="1" bgcolor="#FAFAD2"><tbody>` + html + "</tbody></table>"

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		log.Printf("CourseHelper.GetCourses: failed to parse HTML - %v", err)
		return &types.CourseResponse{
			Status:  500,
			Error:   fmt.Sprintf("failed to parse HTML: %v", err),
			Courses: []types.Course{},
		}, nil
	}

	var courses []types.Course
	rows := doc.Find("tr")

	rows.Each(func(i int, row *goquery.Selection) {
		if i == 0 {
			return
		}

		cells := row.Find("td")
		if cells.Length() > 0 {
			course := c.parseCourseRow(cells)
			if course != nil {
				courses = append(courses, *course)
			}
		}
	})

	return &types.CourseResponse{
		RegNumber: regNumber,
		Courses:   courses,
	}, nil
}

func (c *CoursePage) parseCourseRow(cells *goquery.Selection) *types.Course {
	if cells.Length() < 11 {
		return nil
	}

	getText := func(index int) string {
		return strings.TrimSpace(cells.Eq(index).Text())
	}

	code := getText(1)
	title := getText(2)
	credit := getText(3)
	category := getText(4)
	courseCategory := getText(5)
	courseType := getText(6)
	faculty := getText(7)
	slot := getText(8)
	room := getText(9)
	academicYear := getText(10)

	if credit == "" {
		credit = "N/A"
	}
	if courseType == "" {
		courseType = "N/A"
	}
	if faculty == "" {
		faculty = "N/A"
	}
	if room == "" {
		room = "N/A"
	} else {
		room = strings.ToUpper(room[:1]) + room[1:]
	}
	slot = strings.TrimSuffix(slot, "-")

	return &types.Course{
		Code:           code,
		Title:          strings.Split(title, " \\u2013")[0],
		Credit:         credit,
		Category:       category,
		CourseCategory: courseCategory,
		Type:           courseType,
		SlotType:       c.getSlotType(slot),
		Faculty:        faculty,
		Slot:           slot,
		Room:           room,
		AcademicYear:   academicYear,
	}
}

func (c *CoursePage) getSlotType(slot string) string {
	if strings.Contains(slot, "P") {
		return "Practical"
	}
	return "Theory"
}

func getYear(registrationNumber string) int {
	yearString := registrationNumber[2:4]
	currentYear := time.Now().Year()
	currentMonth := time.Now().Month()
	currentYearLastTwoDigits := currentYear % 100

	academicYearLastTwoDigits := utils.ParseInt(yearString)

	academicYear := currentYearLastTwoDigits
	if currentMonth >= 7 {
		academicYear++
	}

	studentYear := academicYear - academicYearLastTwoDigits

	if academicYearLastTwoDigits > currentYearLastTwoDigits {
		studentYear--
	}

	return studentYear
}
