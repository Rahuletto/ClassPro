"use client";
import { Overall } from "@/types/Marks";
import React, { useState, useEffect } from "react";
import { getGrade, grade_points } from "@/types/Grade";
import { determineGrade } from "@/utils/Grade";

export default function CalculatorSection({ overall }: { overall: Overall }) {
  const [grade, setGrade] = useState("O");
  const [req, setReq] = useState("0");
  const [expectedInternal, setExpectedInternal] = useState(0);

  useEffect(() => {
    const lostMark: number = Number(overall.total) - Number(overall.marks);
    const newGrade = Number(overall.total) == 100 ? getGrade(Number(overall.marks)) : determineGrade(lostMark);
    setGrade(newGrade);
    if (Number(overall.total) != 60) {
      setExpectedInternal(60 - Number(overall.total));
    }
  }, [overall.total, overall.marks]);

  useEffect(() => {
    setReq(
      (
        ((grade_points[grade] - (Number(overall.marks) + expectedInternal)) /
          40) *
        75
      ).toPrecision(3),
    );
  }, [grade, expectedInternal, overall.marks]);

  return (
    <div
      role="alert"
      className="absolute bottom-16 left-0 z-10 ml-2 mt-1 w-[97%] animate-fastfade justify-between flex-col flex gap-2 rounded-2xl bg-light-background-light p-4 px-5 pb-5 pt-2 text-sm text-light-accent transition duration-300 md:bottom-[80px] md:w-[95%] dark:bg-dark-side dark:text-dark-accent"
    >
      <div className="flex items-center justify-between pt-2">
        <div>Enter the required Grade</div>
        <div>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="appearance-none rounded-full border-none bg-light-background-dark px-3 py-1 text-light-color outline-none dark:bg-dark-background-normal dark:text-dark-color"
          >
            {Object.keys(grade_points).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      {60 - Number.parseFloat(overall.total) > 0 && (
        <div className="flex items-center justify-between">
          <p>Expected Internal of {60 - Number.parseFloat(overall.total)}:</p>
          <input
            type="text"
            className="w-16 appearance-none rounded-md border-none bg-light-background-dark px-2 py-1 text-center outline-none dark:bg-dark-background-normal"
            value={expectedInternal}
            maxLength={3}
            max={60 - Number.parseFloat(overall.total)}
            onChange={(e) => {
              if (
                Number(e.target.value) >= 0 &&
                Number(e.target.value) <=
                  Number(60 - Number.parseFloat(overall.total))
              ) {
                setExpectedInternal(Number(e.target.value));
              }
            }}
          />
        </div>
      )}
      <div className="flex flex-row items-center justify-between gap-2">
        <h2>Required Marks</h2>
        <div className="flex items-center gap-1 rounded-full bg-light-background-dark dark:bg-dark-background-dark">
          <span
            className={`pl-2 text-sm font-medium ${
              Number(req) <= 0
                ? "text-light-accent dark:text-dark-accent"
                : Number(req) > 75
                  ? "text-light-error-color dark:text-dark-error-color"
                  : "text-light-success-color dark:text-dark-success-color"
            }`}
          >
            {req}
          </span>
          <span className="ml-1 rounded-full bg-light-success-color px-2 py-0.5 pr-2 text-sm font-bold text-light-success-background dark:bg-dark-success-color dark:text-dark-success-background">
            75
          </span>
        </div>
      </div>
    </div>
  );
}
