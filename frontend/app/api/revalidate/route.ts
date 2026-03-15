import { revalidatePath } from "next/cache";

export async function POST() {
	try {
		// Revalidate all paths that use cached user data
		revalidatePath("/academia");
		revalidatePath("/academia/attendance");
		revalidatePath("/academia/marks");
		revalidatePath("/academia/courses");
		revalidatePath("/academia/timetable");
		revalidatePath("/academia/calendar");
		
		return Response.json({ message: "Cache revalidated" });
	} catch (error) {
		console.error("Revalidation error:", error);
		return Response.json(
			{ message: "Revalidation failed" },
			{ status: 500 }
		);
	}
}
