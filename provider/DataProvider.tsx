"use client";
import { Cookie, Cookie as cookies, getCookie } from "@/utils/Cookies";
import { type ReactNode, createContext, useContext } from "react";
import useSWR from "swr";
import Storage from "@/utils/Storage";
import { AttendanceCourse } from "@/types/Attendance";
import rotateUrl, { revalUrl } from "@/utils/URL";
import { token } from "@/utils/Tokenize";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { User } from "@/types/User";
import { AllResponses } from "@/types/Response";

interface DataContextType {
  attendance: AttendanceCourse[] | null;
  marks: Mark[] | null;
  courses: Course[] | null;
  user: User | null;
  timetable: { day: number; table: (string | undefined)[] }[] | null;
  error: Error | null;
  requestedAt: number | null;
  isLoading: boolean;
  token: string | null;
  isValidating: boolean;
  lastUpdated: number;
  mutate: () => Promise<void | AllResponses | null | undefined>;
}

const DataContext = createContext<DataContextType>({
  attendance: null,
  marks: null,
  courses: null,
  user: null,
  token: null,
  timetable: null,
  error: null,
  requestedAt: null,
  isLoading: false,
  isValidating: false,
  lastUpdated: 0,
  mutate: async () => {},
});

export const fetcher = async (url: string, cookieToken?: string, nostore?: boolean) => {
  const cookie = cookieToken || cookies.get("key");
  if (!cookie) return null;

  if (url.includes("getData")) {
    const response = await fetch(`${rotateUrl()}/getData`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${token()}`,
        "X-CSRF-Token": cookie,
        "Set-Cookie": cookie,
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    });

    const data: AllResponses = await response.json();
    return data;
  } 
    const response = await fetch(`${rotateUrl()}/update`, {
      method: "PATCH",
      headers: {
        cache: "no-cache",
        Authorization: `Bearer ${token()}`,
        "X-CSRF-Token": cookie,
        "Set-Cookie": cookie,
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    });

    const data: AllResponses = await response.json();
    return data;
  
};

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const cookie = cookies.get("key");

  const getCachedData = () => Storage.get<AllResponses | null>("data", null);

  const cached = getCachedData();

  const {
    data: data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<AllResponses | null>(
    cookie
      ? cached && Date.now() - cached.lastUpdated > 1000 * 60 * 30
        ? `${revalUrl}/update`
        : `${revalUrl}/getData`
      : null,
    fetcher,
    {
      fallbackData: getCachedData(),
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      suspense: true,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      refreshInterval: 1000 * 60 * 10,
      revalidateOnMount: true,
      revalidateIfStale: true,
      dedupingInterval: 1000 * 60 * 5,
      errorRetryCount: 0,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        return;
      },
      onSuccess: async (data) => {
        if (data) {
          Storage.set("data", data);
        }

        return data;
      },
    },
  );

  return (
    <DataContext.Provider
      value={{
        user: data?.user || null,
        attendance: data?.attendance || null,
        marks: data?.marks || null,
        courses: data?.course?.courses || null,
        timetable: data?.timetable?.schedule || null,
        token: data?.token || null,
        error: error || null,
        requestedAt: data?.requestedAt || 0,

        isLoading: isLoading,
        lastUpdated: data?.lastUpdated || 0,
        isValidating: isValidating,
        mutate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
