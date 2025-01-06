"use client";
import { useData } from "@/provider/DataProvider";
import { Cookie } from "@/utils/Cookies";
import { authHash } from "@/utils/Tokenize";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsClockHistory, BsPersonCheckFill } from "react-icons/bs";
import { FaBookOpen } from "react-icons/fa";
import { FaGraduationCap, FaUser } from "react-icons/fa6";
import { PiListDashes } from "react-icons/pi";

export default function OAuth() {
  const router = useRouter();

  const cookie = Cookie.get("key");
  

  const searchParams = useSearchParams();
  const validate = searchParams.get("validate");

  const { user } = useData();
  const [clicked, setClicked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!cookie) router.push("/auth/login?redirect=/auth/oauth");
    if (typeof window !== "undefined") {
      setMounted(true);
      if (!validate) router.push("/");
    }
  }, [validate, router, cookie]);

  function onClick() {
    setClicked(true);
    const auth = authHash(user?.regNumber ?? "", validate ?? "");

    router.push(`${validate}?digest=${auth}`);
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center bg-light-background-normal dark:bg-dark-background-normal">
      {mounted && (
        <div className="flex h-auto min-h-[500px] w-auto min-w-[90vw] flex-col items-center justify-between gap-8 rounded-3xl bg-light-background-light p-6 transition-all duration-100 md:min-w-[500px] lg:h-[600px] lg:w-[500px] dark:bg-dark-background-dark">
          <div className="flex w-full flex-col items-center justify-center gap-8 p-2 px-6">
            <FaBookOpen className="text-5xl text-light-accent dark:text-dark-accent" />

            <div className="flex flex-col items-center gap-1 text-light-color dark:text-dark-color">
              <p className="text-sm">Do you want to grant access to</p>
              <h3 className="text-xl font-medium text-light-accent underline dark:text-dark-accent">
                {
                  validate
                    ?.replace("https://", "")
                    .replace("http://", "")
                    .split("/")[0]
                }
              </h3>
            </div>
            <div className="w-full border-t border-dashed border-light-accent/20 p-2 py-4 text-left text-light-color dark:border-dark-accent/20 dark:text-dark-color">
              <p className="text-sm opacity-90">
                They can access the following,
              </p>
              <div className="mt-3 flex flex-col gap-3 pl-4">
                <div className="flex items-center justify-start gap-3 font-mono">
                  <FaUser className="text-lg text-light-accent dark:text-dark-accent" />
                  User
                </div>
                <div className="flex items-center justify-start gap-3 font-mono">
                  <BsClockHistory className="text-lg text-light-accent dark:text-dark-accent" />
                  Timetable
                </div>
                <div className="flex items-center justify-start gap-3 font-mono">
                  <BsPersonCheckFill className="text-lg text-light-accent dark:text-dark-accent" />
                  Attendance
                </div>
                <div className="flex items-center justify-start gap-3 font-mono">
                  <FaGraduationCap className="text-lg text-light-accent dark:text-dark-accent" />
                  Marks
                </div>
                <div className="flex items-center justify-start gap-3 font-mono">
                  <PiListDashes className="text-lg text-light-accent dark:text-dark-accent" />
                  Courses
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <p className="font-mono text-sm text-light-color opacity-50 dark:text-dark-color">
              Signed in as{" "}
              <span className="capitalize">{user?.name.toLowerCase()}</span>
            </p>
            <button
              disabled={clicked}
              onClick={onClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-light-accent p-2 px-6 font-medium text-light-background-dark dark:bg-dark-accent dark:text-dark-background-dark"
            >
              Grant Access
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
