"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useData } from "@/provider/DataProvider";
import Loading from "@/components/States/Loading";
import Error from "@/components/States/Error";
import GradeCard from "./components/GradeCard";
import Indicator from "@/components/Indicator";
import { determineGrade } from "@/utils/Grade";
import { getGrade } from "@/types/Grade";
import { Mark } from "@/types/Marks";

export default function GradeX() {
  const { marks, isLoading, error, courses, isValidating } = useData();
  const [grades, setGrades] = useState<{ [courseCode: string]: string }>({});
  const [sgpa, setSgpa] = useState(0);
  const [excludedCourses, setExcludedCourses] = useState<string[]>([]);

  const [theory, setTheory] = useState<Mark[]>([]);
  const [practicals, setPracticals] = useState<Mark[]>([]);

  const gradePoints: { [key: string]: number } = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
  };

  useEffect(() => {
    marks?.forEach((mark) => {
      setGrades((prevGrades) => ({
        ...prevGrades,
        [mark.courseCode]:
          Number(mark.overall.total) == 100
            ? getGrade(Number(mark.overall.marks))
            : determineGrade(
                Number(mark.overall.total) - Number(mark.overall.marks),
              ),
      }));
    });
  }, [marks]);

  useEffect(() => {
    setTheory(
      marks
        ?.filter((a) => a.courseType === "Theory")
        .filter((a) =>
          courses
            ? (Number(courses.find((c) => c.code === a.courseCode)?.credit) ??
                0) > 0
            : false,
        ) || [],
    );
  }, [marks, courses]);

  useEffect(() => {
    const p =
      marks
        ?.filter((a) => a.courseType === "Practical")
        .filter((a) =>
          courses
            ? (Number(courses.find((c) => c.code === a.courseCode)?.credit) ??
                0) > 0
            : false,
        )
        .filter(
          (practical) =>
            !theory?.some(
              (theory) =>
                theory.courseType === "Theory" &&
                theory.courseCode === practical.courseCode,
            ),
        ) || [];

    setPracticals(p);
  }, [theory, courses, marks]);

  useEffect(() => {
    sgpaCalculator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grades, courses, marks]);

  const updateGrade = (
    courseCode: string,
    grade: string,
    exclude: boolean = false,
  ) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [courseCode]: grade,
    }));

    if (exclude) {
      setExcludedCourses((prevExcluded) => {
        if (prevExcluded.includes(courseCode)) {
          return prevExcluded.filter((code) => code !== courseCode);
        } else {
          return [...prevExcluded, courseCode];
        }
      });
    }
  };

  const sgpaCalculator = () => {
    if (!courses || !grades) return;

    let totalPoints = 0;
    let totalCredits = 0;

    Object.entries(grades).forEach(([courseCode, grade]) => {
      if (excludedCourses.includes(courseCode)) return;

      const course = courses.find((c) => c.code === courseCode);
      if (course) {
        const credits = Number(course.credit);
        const gradePoint = gradePoints[grade] || 0;

        totalPoints += credits * gradePoint;
        totalCredits += credits;
      }
    });

    const calculatedSgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setSgpa(parseFloat(calculatedSgpa.toFixed(2)));
  };

  return (
    <main className="h-screen w-full bg-light-background-normal pb-0 text-light-color dark:bg-dark-background-normal dark:text-dark-color">
      <Sidebar>
        <div className="flex flex-col gap-12">
          <section id="links" className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold text-light-color dark:text-dark-color">
              GradeX
            </h1>

            <div className="flex flex-col gap-6 rounded-3xl border-opacity-10 lg:border lg:p-2 dark:border-white/10">
              {isLoading || isValidating ? (
                <Loading size="3xl" />
              ) : error ? (
                <Error component="GradeX" error={error} />
              ) : marks ? (
                <>
                  <div className="hidden w-full items-center justify-center lg:flex">
                    <h2
                      className={`rounded-2xl border px-8 py-4 text-center text-5xl font-semibold ${sgpa > 8.5 ? "border-transparent bg-light-success-background text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color" : sgpa < 6 ? "border-dashed border-light-error-color bg-light-error-background text-light-error-color dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color" : "border border-light-input bg-light-background-light text-light-color dark:border-dark-input dark:bg-dark-background-darker dark:text-dark-color"}`}
                    >
                      {sgpa} <span className="text-base opacity-40">SGPA</span>
                    </h2>
                  </div>
                  <div className="grid animate-fadeIn grid-cols-1 gap-2 transition-all duration-200 lg:grid-cols-2 xl:grid-cols-3">
                    {theory?.map((mark, index) => (
                      <GradeCard
                        mark={mark}
                        excludedCourses={excludedCourses}
                        key={index}
                        currentGrade={grades[mark.courseCode] || "O"}
                        updateGrade={updateGrade}
                      />
                    ))}
                  </div>

                  {practicals?.[0] && (
                    <>
                      <Indicator type="Practical" separator />
                      <div className="grid animate-fadeIn grid-cols-1 gap-2 transition-all duration-200 lg:grid-cols-2 xl:grid-cols-3">
                        {practicals?.map((mark, index) => (
                          <GradeCard
                            mark={mark}
                            key={index}
                            excludedCourses={excludedCourses}
                            currentGrade={grades[mark.courseCode] || "O"}
                            updateGrade={updateGrade}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="sticky bottom-4 flex items-center justify-center lg:hidden">
                    <h2
                      className={`rounded-full px-6 py-3 text-center text-3xl font-semibold shadow-xl dark:shadow-xl ${sgpa > 8.5 ? "bg-light-success-background text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color" : sgpa < 6 ? "border border-dashed border-light-error-color bg-light-error-background text-light-error-color dark:border-dark-error-color dark:bg-dark-error-background dark:text-dark-error-color" : "border border-light-input bg-light-background-light text-light-color dark:border-dark-input dark:bg-dark-background-darker dark:text-dark-color"}`}
                    >
                      {sgpa} <span className="text-sm opacity-40">SGPA</span>
                    </h2>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </section>
        </div>
      </Sidebar>
    </main>
  );
}
