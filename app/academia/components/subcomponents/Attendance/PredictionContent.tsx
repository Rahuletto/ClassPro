"use client";
import React, { useEffect } from "react";
import { useAttendancePrediction } from "@/hooks/useAttendancePredict";
import Error from "@/components/States/Error";
import Loading from "@/components/States/Loading";
import NoData from "../NoData";
import AttendanceList from "./Predict/AttendanceList";
import {
  DateRange,
  AttendanceCourse,
  CalendarMonth,
  TimetableDay,
} from "@/types/Attendance";
import { useData } from "@/provider/DataProvider";
import { usePlanner } from "@/provider/DataCalProvider";

interface PredictionContentProps {
  dateRange: DateRange[];
}

export default function PredictionContent({
  dateRange,
}: PredictionContentProps): JSX.Element {
  const {
    calendar,
    isLoading: isLoadingCalendar,
    isValidating: isValidatingCalendar,
    error: calendarError,
  } = usePlanner();
  const {
    timetable,
    attendance,
    isLoading: isLoadingTimetable,
    isValidating: isValidatingTimetable,
    error: timetableError,
  } = useData();

  const { predictedAttendance, performPrediction } = useAttendancePrediction(
    attendance as AttendanceCourse[],
    timetable as TimetableDay[],
    calendar as CalendarMonth[],
    dateRange,
  );

  useEffect(() => {
    if (
      attendance &&
      timetable &&
      calendar &&
      dateRange.length > 0 &&
      dateRange.every((range) => range.from && range.to)
    ) {
      console.log("Predicting")
      performPrediction();
    }
  }, [attendance, timetable, calendar, dateRange, performPrediction]);

  if (
    isLoadingCalendar ||
    isLoadingTimetable ||
    isValidatingCalendar ||
    isValidatingTimetable
  )
    return <Loading size="max" />;
  if (calendarError || timetableError)
    return (
      <Error
        error={calendarError || timetableError!}
        component="Attendance Prediction"
      />
    );
  if (!predictedAttendance) return <NoData component="Attendance Prediction" />;

  return (
    <AttendanceList open={true} displayedAttendance={predictedAttendance} />
  );
}
