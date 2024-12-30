import type { NextRequest, NextResponse } from "next/server";

export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonObject
	| JsonArray;

export type NextRouteHandler<
	T extends Record<string, string> = Record<string, never>,
> = (
	request: NextRequest,
	context: { params: Promise<T> },
) => NextResponse | Promise<NextResponse> | Response | Promise<Response>;

export type APIContextOptions<
	T extends Record<string, string> = Record<string, never>,
> = {
	middleware?: NextRouteHandler<T>[];
};

export class APIContextError extends Error {
	public status: number;
	public content: JsonValue;

	constructor(status: number, content: JsonValue, message?: string) {
		super(message || JSON.stringify(content));
		this.name = "APIContextError";
		this.status = status;
		this.content = content;
	}
}

export function withAPIContext<
	T extends Record<string, string> = Record<string, never>,
>(fn: NextRouteHandler<T>, options?: APIContextOptions) {
	return async (request: NextRequest, ctx: { params: Promise<T> }) => {
		try {
			return await fn(request, ctx);
		} catch (e: unknown) {
			if (e instanceof APIContextError) {
				return Response.json(e.content, { status: e.status });
			}
			throw e;
		}
	};
}
