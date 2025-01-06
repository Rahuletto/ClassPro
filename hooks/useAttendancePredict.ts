import { useState, useCallback } from "react";
import {
  AttendanceCourse,
  DateRange,
  CalendarMonth,
  TimetableDay,
} from "@/types/Attendance";
import { format, isWithinInterval } from "date-fns";

export const useAttendancePrediction = (
  attendance: AttendanceCourse[],
  timetable: TimetableDay[],
  calendar: CalendarMonth[],
  dateRanges: DateRange[],
) => {
  const [predictedAttendance, setPredictedAttendance] = useState<
    AttendanceCourse[] | null
  >(null);

  const performPrediction = useCallback(() => {
    if (
      !dateRanges ||
      dateRanges.length === 0 ||
      !attendance ||
      !timetable ||
      !calendar
    ) {
      console.warn("Missing required data for prediction");
      return;
    }

    const updatedAttendance: AttendanceCourse[] = attendance
      .filter((a) => a.courseTitle !== "null")
      .map((a) => ({ ...a }));

    const processDay = (date: Date, incrementAbsent: boolean = false) => {
      const formattedDate = format(date, "d");
      const monthName = format(date, "MMM");
      const currentMonth = calendar.find(
        (m) => monthName === m.month.split("'")[0].trim(),
      );

      if (!currentMonth) return;

      const dayInfo = currentMonth.days.find((d) => d.date === formattedDate);
      if (!dayInfo || dayInfo?.day === "Sun") return;

      const daySchedule = timetable.find(
        (t) => t.day === Number(dayInfo.dayOrder),
      );
      if (!daySchedule) return;

      daySchedule?.table.forEach((subject) => {
        if (!subject) return;

        const cleanedSubject = subject.replace(/\[.*?\]/g, "").trim();
        const [subjectTitle, subjectCategory] = cleanedSubject
          .split(" (")
          .map((s) => s.replace(")", "").trim());

        const courseAttendance = updatedAttendance.find(
          (a) =>
            a.courseTitle === subjectTitle && a.category === subjectCategory,
        );

        if (!courseAttendance) return;

        const conducted = parseInt(courseAttendance.hoursConducted) + 1;
        courseAttendance.hoursConducted = conducted.toString();

        const absent = incrementAbsent
          ? parseInt(courseAttendance.hoursAbsent) + 1
          : parseInt(courseAttendance.hoursAbsent);

        if (incrementAbsent) {
          courseAttendance.hoursAbsent = absent.toString();
        }

        const percentage = (((conducted - absent) / conducted) * 100).toFixed(
          2,
        );
        courseAttendance.attendancePercentage = percentage;
      });
    };

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRanges[0].from || "");

    while (currentDate < endDate) {
      const isAbsentDay = dateRanges.some(
        (range) =>
          range.from &&
          range.to &&
          isWithinInterval(currentDate, {
            start: range.from,
            end: range.to,
          }),
      );

      processDay(currentDate, isAbsentDay);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    dateRanges.forEach((range) => {
      if (range.from && range.to) {
        let rangeStartDate = new Date(range.from);
        rangeStartDate.setHours(0, 0, 0, 0);
        let rangeEndDate = new Date(range.to);
        rangeEndDate.setHours(0, 0, 0, 0);

        while (rangeStartDate <= rangeEndDate) {
          processDay(rangeStartDate, true);
          rangeStartDate.setDate(rangeStartDate.getDate() + 1);
        }
      }
    });

    setPredictedAttendance(updatedAttendance);
  }, [attendance, timetable, calendar, dateRanges]);

  return {
    predictedAttendance,
    performPrediction,
  };
};
