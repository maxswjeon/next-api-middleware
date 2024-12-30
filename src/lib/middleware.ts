import { headers } from "next/headers";
import { APIContextError } from "./api";

export async function withSession() {
	const header = await headers();
	const session = header.get("authorization");
	if (!session) {
		throw new APIContextError(401, { error: "Unauthorized" });
	}
	return session;
}
