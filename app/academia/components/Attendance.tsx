"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/States/Loading";
import { AttendanceHeader } from "./subcomponents/Attendance/AttendanceHeader";
import { AttendanceStatusChips } from "./subcomponents/Attendance/AttendanceStatusChip";
import { CategorizedDateRange, DateRange } from "@/types/Attendance";
import { DateObject } from "react-multi-date-picker";
import ODMLContent from "./subcomponents/Attendance/ODMLContent";

const AttendanceContent = dynamic(
  () => import("./subcomponents/Attendance/AttendanceContent"),
  {
    loading: () => <Loading size="max" />,
  },
);

const PredictionContent = dynamic(
  () => import("./subcomponents/Attendance/PredictionContent"),
  {
    loading: () => <Loading size="max" />,
  },
);

export default function Attendance(): JSX.Element {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [categorizedDateRanges, setCategorizedDateRanges] = useState<
    CategorizedDateRange[]
  >([]);
  const [ODMLdateRange, setODMLDateRange] = useState<DateRange[]>([]);
  const [isPredicted, setIsPredicted] = useState<boolean>(false);
  const [isODML, setIsODML] = useState<boolean>(false);

  useEffect(() => {
    const leaveRanges = categorizedDateRanges.filter(
      (e) => e.category === "Leave",
    );


    if (leaveRanges.length > 0) {
      setIsPredicted(true);
      // Instead of setting the first range, set the overall date range
      const earliestFrom = new Date(
        Math.min(...leaveRanges.map((range) => range.from.getTime())),
      )
      const latestTo = new Date(
        Math.max(...leaveRanges.map((range) => range.to.getTime())),
      )


      setDateRange({
        from: earliestFrom,
        to: latestTo,
      });
    } else {
      setIsPredicted(false);
    }
  }, [categorizedDateRanges]);

  const resetAttendance = (): void => {
    setDateRange({ from: null, to: null });
    setIsPredicted(false);
    setIsODML(false);
    setCategorizedDateRanges([]);
    setODMLDateRange([]);
  };

  const getPredictionDateRanges = (): DateRange[] => {
    if (isPredicted) {
      return categorizedDateRanges
        .filter((range) => range.category === "Leave")
        .map((range) => ({ from: range.from, to: range.to }));
    }
    return [];
  };

  return (
    <section id="attendance">
      <AttendanceHeader
        categorizedDateRanges={categorizedDateRanges}
        setCategorizedDateRanges={setCategorizedDateRanges}
      />

      <AttendanceStatusChips
        isPredicted={isPredicted}
        dateRange={dateRange}
        resetAttendance={resetAttendance}
      />

      <div
        className={`group -mx-3 rounded-xl border border-dashed pt-3 lg:!mx-0 ${
          isPredicted || isODML
            ? "border-light-info-color dark:border-dark-info-color"
            : "border-transparent"
        }`}
      >
        {isPredicted ? (
          <PredictionContent dateRange={getPredictionDateRanges()} />
        ) : isODML ? (
          <ODMLContent dateRanges={ODMLdateRange} />
        ) : (
          <AttendanceContent />
        )}
      </div>
    </section>
  );
}
