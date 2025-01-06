"use client";

import * as React from "react";
import { format, isWithinInterval, startOfToday } from "date-fns";
import { LuTrash2 } from "react-icons/lu";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlanner } from "@/provider/DataCalProvider";
import { CategorizedDateRange } from "@/types/Attendance";

type DateCategory = "Leave" | "OD";

interface LeaveODRangeCalendarProps {
  categorizedRanges: CategorizedDateRange[];
  setCategorizedRanges: React.Dispatch<
    React.SetStateAction<CategorizedDateRange[]>
  >;
}

export function LeaveODRangeCalendar({
  categorizedRanges,
  setCategorizedRanges,
}: LeaveODRangeCalendarProps) {
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const { calendar } = usePlanner();

  const handleSelect = (value: any) => {
    if (!value) return;
    setDateRange(value);
  };

  const handleCategoryAdd = (category: DateCategory) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(80);
    }
    if (dateRange.from && dateRange.to) {
      const newRange = { from: dateRange.from, to: dateRange.to, category };

      const hasOverlap = categorizedRanges.some(
        (range) =>
          isWithinInterval(newRange.from, {
            start: range.from,
            end: range.to,
          }) ||
          isWithinInterval(newRange.to, { start: range.from, end: range.to }) ||
          isWithinInterval(range.from, {
            start: newRange.from,
            end: newRange.to,
          }) ||
          isWithinInterval(range.to, {
            start: newRange.from,
            end: newRange.to,
          }),
      );

      if (!hasOverlap) {
        setCategorizedRanges((prev) => [...prev, newRange]);
        setDateRange({ from: undefined, to: undefined });
      } else {
        alert("This range overlaps with an existing categorized range.");
      }
    }
  };

  const handleDelete = (rangeToDelete: CategorizedDateRange) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
    setCategorizedRanges((prev) =>
      prev.filter((range) => range !== rangeToDelete),
    );
  };

  const today = startOfToday();

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl bg-light-background-light dark:bg-dark-background-dark">
      <div className="flex w-full flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-between lg:max-w-[50%]">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            className="w-full rounded-xl"
            modifiers={{
              leaveEnds: (date) =>
                categorizedRanges.some(
                  (range) =>
                    (format(date, "yyyy-MM-dd") ===
                      format(range.from, "yyyy-MM-dd") ||
                      format(date, "yyyy-MM-dd") ===
                        format(range.to, "yyyy-MM-dd")) &&
                    range.category === "Leave",
                ),
              odEnds: (date) =>
                categorizedRanges.some(
                  (range) =>
                    (format(date, "yyyy-MM-dd") ===
                      format(range.from, "yyyy-MM-dd") ||
                      format(date, "yyyy-MM-dd") ===
                        format(range.to, "yyyy-MM-dd")) &&
                    range.category === "OD",
                ),
              holidays: (date) => {
                const monthIndex =
                  calendar?.findIndex((month) =>
                    month.month.includes(format(date, "MMM")),
                  ) || 0;
                const formatted = format(date, "dd");
                const cal = calendar?.[monthIndex]?.days?.find(
                  (day) => day.date.padStart(2, "0") === formatted,
                );
                return cal?.dayOrder === "-";
              },
              leave: (date) =>
                categorizedRanges.some(
                  (range) =>
                    isWithinInterval(date, {
                      start: range.from,
                      end: range.to,
                    }) && range.category === "Leave",
                ),
              od: (date) =>
                categorizedRanges.some(
                  (range) =>
                    isWithinInterval(date, {
                      start: range.from,
                      end: range.to,
                    }) && range.category === "OD",
                ),
              presented: (date) => {
                const leaveRanges = categorizedRanges
                  .filter(
                    (range) =>
                      range.category === "Leave" || range.category === "OD",
                  )
                  .sort((a, b) => a.from.getTime() - b.from.getTime());

                if (leaveRanges.length === 0) return false;

                const lastLeave = leaveRanges[leaveRanges.length - 1];
                return (
                  date >= today &&
                  date < lastLeave.to &&
                  !leaveRanges.some((range) =>
                    isWithinInterval(date, {
                      start: range.from,
                      end: range.to,
                    }),
                  )
                );
              },
            }}
            modifiersClassNames={{
              holidays:
                "!text-light-error-color dark:!text-dark-error-color !opacity-60 !bg-transparent !dark:bg-transparent cursor-not-allowed",
              leaveEnds: `bg-light-error-color dark:bg-dark-error-color !text-black hover:bg-light-error-background !dark:hover:bg-dark-error-background hover:text-light-error-color dark:hover:text-dark-error-color !rounded-md`,
              odEnds:
                "bg-light-info-color dark:bg-dark-info-color !text-black hover:bg-light-info-background dark:hover:bg-dark-info-background hover:text-light-info-color dark:hover:text-dark-info-color !rounded-md",
              leave:
                "bg-light-error-background dark:bg-dark-error-background rounded-none text-light-error-color dark:text-dark-error-color",
              od: "bg-light-info-background dark:bg-dark-info-background rounded-none text-light-info-color dark:text-dark-info-color",
              presented:
                "bg-light-success-background/70 dark:bg-dark-success-background/70 rounded-sm",
            }}
            disabled={[
              (date) =>
                date < today ||
                date >
                  new Date(
                    today.getFullYear(),
                    today.getMonth() + 3,
                    today.getDate(),
                  ),
              { dayOfWeek: [0, 6] },
              (date) => {
                const monthIndex =
                  calendar?.findIndex((month) =>
                    month.month.includes(format(date, "MMM")),
                  ) || 0;

                const formatted = format(date, "dd");

                const cal = calendar?.[monthIndex]?.days?.find(
                  (day) => day.date.padStart(2, "0") === formatted,
                );

                return cal?.dayOrder === "-";
              },
            ]}
            fromDate={today}
          />
          <div className="flex flex-row gap-3 p-1 items-center justify-center">
            <div className="flex items-center justify-center gap-2 rounded-md bg-light-error-background font-mono text-xs text-light-error-color dark:bg-dark-error-background dark:text-dark-error-color">
              <div className="h-4 w-4 rounded-md bg-light-error-color dark:bg-dark-error-color" />
              A
              <div className="h-4 w-4 rounded-md bg-light-error-color dark:bg-dark-error-color" />
            </div>

            {/* <div className="flex items-center justify-center gap-2 rounded-md bg-light-info-background font-mono text-xs text-light-info-color dark:bg-dark-info-background dark:text-dark-info-color">
              <div className="h-4 w-4 rounded-md bg-light-info-color dark:bg-dark-info-color" />
              OD
              <div className="h-4 w-4 rounded-md bg-light-info-color dark:bg-dark-info-color" />
            </div> */}

            <div className="flex items-center justify-center gap-1 rounded-md px-3 bg-light-success-background/80 font-mono text-xs text-light-success-color dark:bg-dark-success-background/80 dark:text-dark-success-color">
              P
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 lg:max-w-[50%]">
          <ScrollArea className="h-[330px] border-t border-neutral-200 p-2 md:border-l md:border-t-0 lg:h-[330px] dark:border-neutral-800">
            <div className="flex flex-col gap-1">
              {categorizedRanges.filter((a) => a.category === "Leave").length >
                0 && (
                <span className="ml-1 font-mono text-xs font-semibold opacity-15">
                  Leave
                </span>
              )}
              {categorizedRanges
                .filter((a) => a.category === "Leave")
                .map((range, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between rounded-md bg-light-background-normal dark:bg-dark-background-normal",
                    )}
                  >
                    <span className="px-3 py-1 text-sm font-medium">
                      {format(range.from, "MMM dd")} to{" "}
                      {format(range.to, "MMM dd")}
                    </span>
                    <Button
                      className="bg-light-error-background text-light-error-color hover:bg-light-error-background dark:bg-dark-error-background dark:text-dark-error-color dark:hover:bg-dark-error-background"
                      size="icon"
                      onClick={() => handleDelete(range)}
                    >
                      <LuTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              {categorizedRanges.filter((a) => a.category === "OD").length >
                0 && (
                <span className="ml-1 mt-2 font-mono text-xs font-semibold opacity-15">
                  OD/ML
                </span>
              )}
              {categorizedRanges
                .filter((a) => a.category === "OD")
                .map((range, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between rounded-md bg-light-background-normal dark:bg-dark-background-normal",
                    )}
                  >
                    <span className="px-3 py-1 text-sm font-medium">
                      {format(range.from, "MMM dd")} to{" "}
                      {format(range.to, "MMM dd")}
                    </span>
                    <Button
                      className="bg-light-error-background text-light-error-color hover:bg-light-error-background dark:bg-dark-error-background dark:text-dark-error-color dark:hover:bg-dark-error-background"
                      size="icon"
                      onClick={() => handleDelete(range)}
                    >
                      <LuTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="mt-4 flex space-x-2 p-1">
        <Button
          onClick={() => handleCategoryAdd("Leave")}
          disabled={!dateRange.from || !dateRange.to}
          className="flex-1 rounded-lg border-light-error-color bg-light-error-background font-semibold text-light-error-color hover:bg-light-error-color hover:text-dark-error-background disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color dark:hover:bg-dark-error-color"
        >
          Add as Leave
        </Button>
        {/* <Button
          onClick={() => handleCategoryAdd("OD")}
          disabled={!dateRange.from || !dateRange.to}
          className="flex-1 rounded-lg border-light-info-color bg-light-info-background font-semibold text-light-info-color hover:bg-light-info-color hover:text-dark-info-background disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-info-color dark:bg-dark-info-background dark:text-dark-info-color dark:hover:bg-dark-info-color"
        >
          Add as OD
        </Button> */}
      </div>
    </div>
  );
}
