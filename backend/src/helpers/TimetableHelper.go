package helpers

import (
	"fmt"
	"goscraper/src/types"
	"log"
	"strings"
)

var batch1 = types.Batch{
	Batch: "1",
	Slots: []types.Slot{
		{Day: 1, DayOrder: "Day 1", Slots: []string{"A", "A", "F", "F", "G", "P6", "P7", "P8", "P9", "P10"}},
		{Day: 2, DayOrder: "Day 2", Slots: []string{"P11", "P12", "P13", "P14", "P15", "B", "B", "G", "G", "A"}},
		{Day: 3, DayOrder: "Day 3", Slots: []string{"C", "C", "A", "D", "B", "P26", "P27", "P28", "P29", "P30"}},
		{Day: 4, DayOrder: "Day 4", Slots: []string{"P31", "P32", "P33", "P34", "P35", "D", "D", "B", "E", "C"}},
		{Day: 5, DayOrder: "Day 5", Slots: []string{"E", "E", "C", "F", "D", "P46", "P47", "P48", "P49", "P50"}},
	},
}

var batch2 = types.Batch{
	Batch: "2",
	Slots: []types.Slot{
		{Day: 1, DayOrder: "Day 1", Slots: []string{"P1", "P2", "P3", "P4", "P5", "A", "A", "F", "F", "G"}},
		{Day: 2, DayOrder: "Day 2", Slots: []string{"B", "B", "G", "G", "A", "P16", "P17", "P18", "P19", "P20"}},
		{Day: 3, DayOrder: "Day 3", Slots: []string{"P21", "P22", "P23", "P24", "P25", "C", "C", "A", "D", "B"}},
		{Day: 4, DayOrder: "Day 4", Slots: []string{"D", "D", "B", "E", "C", "P36", "P37", "P38", "P39", "P40"}},
		{Day: 5, DayOrder: "Day 5", Slots: []string{"P41", "P42", "P43", "P44", "P45", "E", "E", "C", "F", "D"}},
	},
}

type Timetable struct {
	cookie string
}

func NewTimetable(cookie string) *Timetable {
	return &Timetable{cookie: cookie}
}

func (t *Timetable) GetTimetable(batchNumber int) (*types.TimetableResult, error) {
	coursePage := NewCoursePage(t.cookie)
	courseList, err := coursePage.GetCourses()
	if err != nil {
		log.Printf("TimetableHelper.GetTimetable: failed to get courses - %v", err)
		return &types.TimetableResult{
			RegNumber: "",
			Batch:     fmt.Sprintf("%d", batchNumber),
			Schedule:  []types.DaySchedule{},
		}, nil
	}

	// Select the batch based on the input parameter
	var selectedBatch types.Batch
	switch batchNumber {
	case 1:
		selectedBatch = batch1
	case 2:
		selectedBatch = batch2
	default:
		log.Printf("TimetableHelper.GetTimetable: invalid batch number %d", batchNumber)
		return &types.TimetableResult{
			RegNumber: "",
			Batch:     fmt.Sprintf("%d", batchNumber),
			Schedule:  []types.DaySchedule{},
		}, nil
	}

	// Map the slots for the selected batch
	mappedSchedule := t.mapSlotsToSubjects(selectedBatch, courseList.Courses)

	return &types.TimetableResult{
		RegNumber: courseList.RegNumber,
		Batch:     selectedBatch.Batch,
		Schedule:  mappedSchedule,
	}, nil
}

func (t *Timetable) getSlotsFromRange(slotRange string) []string {
	return strings.Split(slotRange, "-")
}

func (t *Timetable) mapSlotsToSubjects(batch types.Batch, subjects []types.Course) []types.DaySchedule {

	slotMapping := make(map[string][]types.TableSlot)

	for _, subject := range subjects {
		var slots []string
		if strings.Contains(subject.Slot, "-") {
			slots = t.getSlotsFromRange(subject.Slot)
		} else {
			slots = []string{subject.Slot}
		}

		isOnline := strings.Contains(strings.ToLower(subject.Room), "online")
		slotType := "Practical"
		if !isOnline {
			slotType = subject.SlotType
		}

		for _, slot := range slots {
			tableSlot := types.TableSlot{
				Code:       subject.Code,
				Name:       subject.Title,
				Online:     isOnline,
				CourseType: slotType,
				RoomNo:     subject.Room,
				Slot:       slot,
			}
			slotMapping[slot] = append(slotMapping[slot], tableSlot)
		}
	}

	var schedule []types.DaySchedule
	for _, day := range batch.Slots {
		var table []interface{}
		for _, slot := range day.Slots {
			if slots, ok := slotMapping[slot]; ok {
				if len(slots) > 1 {
					// Merge multiple courses for the same slot
					merged := types.TableSlot{
						Code:       strings.Join(uniqueCodes(slots), "/"),
						Name:       strings.Join(uniqueNames(slots), "/"),
						Online:     slots[0].Online,
						CourseType: slots[0].CourseType,
						RoomNo:     strings.Join(uniqueRooms(slots), "/"),
						Slot:       slot,
					}
					table = append(table, merged)
				} else {
					table = append(table, slots[0])
				}
			} else {
				table = append(table, nil)
			}
		}
		schedule = append(schedule, types.DaySchedule{Day: day.Day, Table: table})
	}

	return schedule
}

func uniqueCodes(slots []types.TableSlot) []string {
	seen := make(map[string]bool)
	var result []string
	for _, slot := range slots {
		if !seen[slot.Code] {
			seen[slot.Code] = true
			result = append(result, slot.Code)
		}
	}
	return result
}

func uniqueNames(slots []types.TableSlot) []string {
	seen := make(map[string]bool)
	var result []string
	for _, slot := range slots {
		if !seen[slot.Name] {
			seen[slot.Name] = true
			result = append(result, slot.Name)
		}
	}
	return result
}

func uniqueRooms(slots []types.TableSlot) []string {
	seen := make(map[string]bool)
	var result []string
	for _, slot := range slots {
		if !seen[slot.RoomNo] {
			seen[slot.RoomNo] = true
			result = append(result, slot.RoomNo)
		}
	}
	return result
}

func (t *Timetable) mapWithFallback(subjects types.CourseResponse) *types.TimetableResult {
	batches := []types.Batch{batch1, batch2}

	for _, batch := range batches {
		// First, check if this batch has any practical slots
		hasPracticals := false
		for _, daySlot := range batch.Slots {
			for _, slot := range daySlot.Slots {
				if strings.HasPrefix(slot, "P") {
					hasPracticals = true
					break
				}
			}
			if hasPracticals {
				break
			}
		}

		// Skip this batch if it has no practicals but courses have practical slots
		hasPracticalCourses := false
		for _, course := range subjects.Courses {
			if strings.HasPrefix(course.Slot, "P") {
				hasPracticalCourses = true
				break
			}
		}
		if hasPracticalCourses && !hasPracticals {
			continue
		}

		mappedSchedule := t.mapSlotsToSubjects(batch, subjects.Courses)

		// Rest of the existing slot matching logic
		for _, course := range subjects.Courses {
			if !strings.HasPrefix(course.Slot, "P") {
				continue
			}

			var courseSlots []string
			if strings.Contains(course.Slot, "-") {
				courseSlots = t.getSlotsFromRange(course.Slot)
			} else {
				courseSlots = []string{course.Slot}
			}

			for _, courseSlot := range courseSlots {
				for _, daySlot := range batch.Slots {
					for _, slot := range daySlot.Slots {
						if courseSlot == slot {
							return &types.TimetableResult{
								RegNumber: subjects.RegNumber,
								Batch:     batch.Batch,
								Schedule:  mappedSchedule,
							}
						}
					}
				}
			}
		}
	}

	return nil
}
