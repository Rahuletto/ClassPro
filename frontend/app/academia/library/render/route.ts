import { decodeString } from "@/misc/encode";

export const runtime = "edge";

export async function GET(req: Request) {
	const agent = req.headers.get("user-agent");
	if (
		!agent?.includes("Google AppsViewer;") ||
		!agent?.includes("drive.google.com")
	)
		return new Response("NUH UH", { status: 404 });
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	const decodedId = decodeString(id as string);
	return Response.redirect(`${decodedId}`);
}
