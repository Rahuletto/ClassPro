import { decodeString } from "@/misc/encode";

export const runtime = "edge";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	const decodedId = decodeString(id as string);
	return Response.redirect(`${decodedId}`);
}
