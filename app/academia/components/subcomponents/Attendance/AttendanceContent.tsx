import React from "react";
import { useAttendance } from "@/provider/AttendanceProvider";
import Error from "@/components/States/Error";
import Loading from "@/components/States/Loading";
import NoData from "../NoData";
import AttendanceList from "./Predict/AttendanceList";
import { AttendanceCourse } from "@/types/Attendance";
import { useData } from "@/provider/DataProvider";

export default function AttendanceContent(): JSX.Element {
  const { attendance, isLoading, error } = useData();

  if (isLoading) return <Loading size="max" />;
  if (error) return <Error component="Attendance" />;
  if (!attendance) return <NoData component="Attendance" />;

  return (
    <div
      className={`${false ? "border-light-info-color dark:border-dark-info-color" : "border-transparent"} -mx-2 rounded-2xl border-4 border-dotted`}
    >
      <AttendanceList
        open={false}
        displayedAttendance={attendance as AttendanceCourse[]}
      />
    </div>
  );
}
