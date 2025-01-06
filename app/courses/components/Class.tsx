import React from "react";

interface ClassProps {
  classroom: string;
  category: "Practical" | "Theory";
  className?: string;
}

export default function Class({ classroom, category, className }: ClassProps) {
  return category === "Practical" ? (
    <span title={classroom} aria-label={classroom} className={className + " border-light-success-color dark:border-dark-success-color border-dashed border rounded-full bg-light-success-background px-3 py-1 text-center text-xs font-semibold capitalize text-light-success-color dark:bg-dark-success-background dark:text-practical"}>
      {classroom.replace("Basic Engineering Lab", "BEL")}
    </span>
  ) : (
    <span title={classroom} aria-label={classroom} className={className + " rounded-full bg-light-warn-background px-3 py-1 text-center text-xs font-semibold capitalize text-light-warn-color dark:bg-dark-warn-background dark:text-theory"}>
      {classroom.replace("Basic Engineering Lab", "BEL")}
    </span>
  );
}
