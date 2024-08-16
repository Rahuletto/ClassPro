import Link from "@/components/Link";
import dynamic from "next/dynamic";
import { FaBookOpen } from "react-icons/fa";

const Bento = dynamic(() => import("../components/Bento").then(a => a.default), { ssr: false });

export default function Academia() {
  return (
    <main className="flex flex-col items-center justify-start gap-4 bg-light-background-normal p-4 dark:bg-dark-background-normal">
      <div className="flex h-full w-full animate-fadeIn flex-col items-center justify-start gap-2 rounded-3xl bg-light-background-dark px-6 py-12 transition-all duration-300 md:px-12 lg:flex-row lg:gap-6 lg:py-6 dark:bg-dark-background-dark">
        <FaBookOpen className="text-6xl text-light-accent lg:text-4xl dark:text-dark-accent" />
        <h1 className="text-2xl font-semibold text-light-color lg:text-xl dark:text-dark-color">
          SRM Club
        </h1>
        <Link
          href="/auth/login"
          className="text-md flex w-auto transform items-center justify-center rounded-xl border-2 border-transparent bg-light-accent px-3 py-1 text-lg font-semibold text-dark-color transition-all duration-300 hover:border-light-accent hover:bg-transparent hover:px-7 hover:text-light-accent dark:bg-dark-accent dark:text-light-color hover:dark:border-dark-accent hover:dark:text-dark-accent"
        >
          Login
        </Link>
      </div>

      <div className="h-auto w-full animate-fadeIn flex-col items-center justify-center gap-6 rounded-3xl bg-light-background-dark px-8 py-6 transition-all duration-300 md:px-12 md:py-12 dark:bg-dark-background-dark">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">

        </div>
      </div>
      <div className="h-auto w-full animate-fadeIn flex-col gap-6 rounded-3xl bg-light-warn-background px-6 py-4 md:px-12 md:py-6 dark:bg-dark-warn-background">
        <h3 className="text-light-warn-color dark:text-dark-warn-color">
         This website acts as a
          wrapper and does not store any information.
        </h3>
      </div>
    </main>
  );
}
