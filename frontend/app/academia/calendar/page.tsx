import { fetchCalendar } from "@/hooks/fetchCalendar";
import React, { Suspense } from "react";

import Loading from "@/components/States/Loading";
import dynamic from "next/dynamic";
import { fetchUserData } from "@/hooks/fetchUserData";
import { supabase } from "@/utils/Database/supabase";

const CalendarGrid = dynamic(() => import("./components/Grid"));

export default async function Calendar() {
	const { calendar, index } = await fetchCalendar();
	const { user } = await fetchUserData();

	return (
		<main className="pb-3">
			<Suspense fallback={<Loading size="xl" />}>
				<CalendarGrid freesub={false} calendar={calendar} index={index} isDownload={false} />
			</Suspense>
		</main>
	);
}
