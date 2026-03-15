import { token } from "@/utils/Tokenize";
import rotateUrl from "@/utils/URL";
import { cookies } from "next/headers";

export async function DELETE() {
	const cookieStore = await cookies();
	const keyValue = cookieStore.get("key")?.value ?? "";

	const a = await fetch(`${rotateUrl()}/logout`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token()}`,
			"X-CSRF-Token": keyValue,
		},
	});

	// Clear all cookies regardless of backend response
	for (const c of cookieStore.getAll()) {
		cookieStore.delete(c.name);
	}

	return Response.json({ 
		message: a.ok ? "Logged out successfully" : "Logout initiated (local session cleared)",
		success: true 
	});
}
