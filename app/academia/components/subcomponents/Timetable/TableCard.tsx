import React, { useMemo, useState } from "react";
import { constructNullStyles } from "@/components/Generators/Timetable";
import { useInterval } from "@/utils/Interval";
import { timeRange } from "@/utils/Range";
import { getISTTime, Time } from "@/utils/Times";
import { useData } from "@/provider/DataProvider";
import { usePlanner } from "@/provider/DataCalProvider";

interface SubjectCellProps {
  subject: string | null;
  type: string | undefined;
  isActive: boolean;
  inRange: boolean;
  classRoom: string | null;
  ampm?: boolean;
  nullStyler: React.CSSProperties;
  index: number;
}

const SubjectCell: React.FC<SubjectCellProps> = ({
  subject,
  type,
  ampm,
  isActive,
  classRoom,
  inRange,
  nullStyler,
  index,
}) => {
  const baseClasses = useMemo(
    () =>
      `
    group relative h-auto ${
      !subject || (subject === "null" && isActive)
        ? "flex items-center justify-center"
        : ""
    } xl:min-h-24 min-h-16 xl:w-[10%] w-full border-[0.3px] border-dark-background-dark p-2 ${
      isActive ? "pb-2" : "pb-8"
    } text-xs font-semibold text-dark-background-dark ${
      type === "Theory"
        ? "bg-theory"
        : type === "Practical"
          ? "bg-practical"
          : ""
    } ${
      index === 0
        ? "xl:rounded-l-xl xl:rounded-t-none xl:rounded-tl-xl rounded-t-xl"
        : index === 9
          ? "xl:rounded-r-xl xl:rounded-b-none xl:rounded-br-xl rounded-b-xl"
          : ""
    }`,
    [subject, isActive, type, index],
  );

  const style: React.CSSProperties = useMemo(
    () =>
      subject && subject !== "null"
        ? {
            opacity: inRange && !isActive ? 0.5 : isActive ? 1 : undefined,
          }
        : {
            ...nullStyler,
            opacity: inRange && !isActive ? undefined : 1,
            display: isActive ? "flex" : undefined,
            alignItems: isActive ? "center" : undefined,
            justifyContent: isActive ? "center" : undefined,
          },
    [subject, inRange, isActive, nullStyler],
  );

  return (
    <div className={baseClasses} style={style}>
      {subject && subject !== "null" ? (
        subject.split(" – ")[0]?.split(":")[0].replace("Physical and Mental Health using ", "")
      ) : isActive ? (
        <span
          style={constructNullStyles(0, index, [], false, true)}
          className="rounded-full p-2"
        ></span>
      ) : null}
      {classRoom && (
        <span
          className="absolute bottom-2 left-2 flex text-xs capitalize opacity-70 min-w-12 line-clamp-1 overflow-ellipsis"
        >
          {classRoom.replace("Laboratory", "Lab").replace("Basic Engineering Lab", "BEL").replace("Hi-tech building ,","Hi-Tech").replace("main campus", "")}
        </span>
      )}
      <span
        className={`absolute ${
          classRoom ? "bottom-1 md:bottom-6" : "bottom-1"
        } right-2 ${subject && subject !== "null" ? "text-black opacity-40" : "text-white opacity-10"} text-[10px] font-normal transition duration-200 xl:left-2 xl:opacity-0 xl:group-hover:opacity-40`}
      >
        {ampm
          ? ` ${Number(Time.start[index].split(":")[0]) % 12 || 12}:${Time.start[index].split(":")[1]}${Number(Time.start[index].split(":")[0]) >= 12 ? "PM" : "AM"} - ${Number(Time.end[index].split(":")[0]) % 12 || 12}:${Time.end[index].split(":")[1]}${Number(Time.end[index].split(":")[0]) >= 12 ? "PM" : "AM"}`
          : `${Time.start[index]} - ${Time.end[index]}`}
      </span>
    </div>
  );
};

interface TableCardProps {
  view: boolean;
  currentDayOrder: number;
  ampm?: boolean;
}

const TableCard: React.FC<TableCardProps> = ({
  view,
  currentDayOrder,
  ampm,
}) => {
  const { timetable, courses } = useData();
  const { dayOrder: day } = usePlanner();
  const [time, setTime] = useState<Date>(getISTTime());

  const getClass = (subject?: string) => {
    if (!subject || !courses) return;
    if (subject.split("[")[1]) {
      return subject.split("[")[1].split("]")[0];
    }
    const match = subject.match(/^(.*?) \((.*?)\)$/);
    if (!match) return;

    const courseTitle = match[1].trim();
    const courseType = match[2].trim();

    const course = courses.find(
      (course) =>
        course.title.toLowerCase().trim() ===
          courseTitle.toLowerCase().trim() &&
        course.slotType.toLowerCase().trim() ===
          courseType.toLowerCase().trim(),
    );

    return course ? course.room : null;
  };

  useMemo(() => {
    setTime(getISTTime());
  }, []);

  useInterval(() => {
    setTime(getISTTime());
  }, 30 * 1000);

  if (!day || !timetable || isNaN(currentDayOrder)) {
    return (
      <div className="flex h-28 animate-fadeIn items-center justify-center rounded-xl bg-light-error-background transition-all duration-200 md:h-24 dark:bg-dark-error-background">
        <h1
          aria-label="Holiday"
          className="text-3xl font-semibold text-light-error-color dark:text-dark-error-color"
        >
          {!day || !timetable ? "Error" : "Holiday"}
        </h1>
      </div>
    );
  }

  const inRange = timeRange(
    time,
    `${Time.start[0]}-${Time.end[Time.end.length - 1]}`,
  );

  return (
    <div className="flex w-full animate-fadeIn flex-col justify-between rounded-xl bg-light-background-light transition duration-200 xl:flex-row dark:bg-dark-background-dark">
      {timetable[currentDayOrder - 1]?.table?.map((sub, i) => {
        const [subject, typeWithParens] = sub?.split("(") ?? [];
        const type = typeWithParens?.split(")")?.[0];
        const nullStyler = constructNullStyles(
          0,
          i,
          timetable[currentDayOrder - 1]?.table,
          true,
          true,
        );
        const isActive = timeRange(time, `${Time.start[i]}-${Time.end[i]}`);
        const classroom = getClass(sub);

        return (
          <SubjectCell
            key={i}
            ampm={ampm}
            classRoom={view ? (classroom ?? "") : ""}
            subject={subject}
            type={type}
            isActive={isActive}
            inRange={inRange}
            nullStyler={nullStyler}
            index={i}
          />
        );
      })}
    </div>
  );
};

export default TableCard;
