import { headers } from "next/headers";
import {
	APIContextError,
	CONTINUE,
	withAPIContext,
	type APIContextPreRequestHandler,
} from "./api";

export async function withSession() {
	const header = await headers();
	const session = header.get("authorization");
	if (!session) {
		throw new APIContextError(401, { error: "Unauthorized" });
	}
	return session;
}

export const auditPreRequest: APIContextPreRequestHandler<{
	auditToken: string;
}> = async (request, ctx, middlewareContext) => {
	return CONTINUE;
};

export const preRequest1: APIContextPreRequestHandler<{
	param1: string;
}> = async (request, ctx, middlewareContext) => {
	return CONTINUE;
};

withAPIContext((req, ctx) => Response.json({}), {
	preRequest: [auditPreRequest, preRequest1],
	postRequest: [],
});
