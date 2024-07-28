"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import Timetable from "./components/Timetable";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { Cookie } from "@/utils/Cookies";
import Marks from "./components/Marks";

export default function Academia() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const cookies = Cookie.get("key");
    if (!cookies) router.push("/auth/login");
  }, [router]);

  if (!isMounted) {
    return null;
  } else
    return (
      <div className="h-screen w-full bg-light-background-normal text-light-color dark:bg-dark-background-normal dark:text-dark-color">
        <Sidebar>
          <div className="flex flex-col gap-12">
            <Timetable />
            <Marks />
          </div>
        </Sidebar>
      </div>
    );
}
