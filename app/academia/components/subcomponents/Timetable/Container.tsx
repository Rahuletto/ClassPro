"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

import TableHeader from "./TableHeader";

const TableCard = dynamic(() => import("./TableCard").then((a) => a.default), {
  ssr: false,
});

interface ContainerProps {
  currentDayOrder: number;
  ampm?: boolean;
  day?: string | null;
}

export default function Container({ currentDayOrder, day, ampm }: ContainerProps) {
  const [view, setView] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <div
        style={{ WebkitUserSelect: "none" }}
        className={`${!(isNaN(Number(currentDayOrder)) || currentDayOrder === Number(day)) ? "border-dashed border-light-warn-color dark:border-dark-warn-color" : "border-transparent"} text-md min-w-full animate-fadeIn select-none rounded-2xl border-2 bg-light-background-dark p-0.5 text-left transition duration-200 dark:bg-dark-background-normal`}
      >
        <TableHeader />
        <TableCard ampm={ampm} view={view} currentDayOrder={currentDayOrder} />
      </div>

        {!isNaN(currentDayOrder) ? (
          <div className="flex animate-fadeIn w-full flex-row items-center justify-center transition duration-150">
            <button
              onClick={() => {
                setView((prev) => !prev);
              }}
              className={`h-2 w-3 rounded-full border-2 opacity-50 ring-1 transition duration-150 ${view ? "dark:border-dark-side border-light-side bg-light-success-color ring-light-success-color dark:bg-dark-success-color dark:ring-dark-success-color" : "border-dark-side ring-transparent"} p-1`}
            />
            <button
              className="px-3 font-medium opacity-40 transition duration-150"
              onClick={() => {
                setView((prev) => !prev);
              }}
            >
              {view ? "Hide" : "Show"} classrooms
            </button>
          </div>
        ) : <span />}

    </div>
  );
}
