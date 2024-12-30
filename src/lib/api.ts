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

export const CONTINUE = true as const;

export type APIContextPreRequestHandler<
	C extends Record<string, unknown>,
	T extends Record<string, string> = Record<string, never>,
> = (
	request: NextRequest,
	context: { params: Promise<T> },
	middlewareContext: C,
) =>
	| NextResponse
	| Promise<NextResponse>
	| Response
	| Promise<Response>
	| true
	| Promise<true>;

export type APIContextPostRequestHandler<
	T extends Record<string, string> = Record<string, never>,
> = (
	request: NextRequest,
	context: { params: Promise<T> },
) => true | Promise<true>;

export type APIContextOptions<
	T extends Record<string, string> = Record<string, never>,
	C extends Record<string, unknown> = Record<string, never>,
	PreRequest extends
		APIContextPreRequestHandler<C>[] = APIContextPreRequestHandler<C>[],
> = {
	preRequest?: PreRequest;
	postRequest?: APIContextPostRequestHandler<T>[];
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

export type UnionToIntersection<U> = (
	U extends unknown
		? (k: U) => void
		: never
) extends (k: infer I) => void
	? I
	: never;

export type MergePreRequestContexts<
	Handlers extends Array<APIContextPreRequestHandler<Record<string, unknown>>>,
> = UnionToIntersection<
	Handlers[number] extends APIContextPreRequestHandler<
		infer Ctx,
		Record<string, never>
	>
		? Ctx
		: never
>;

export function withAPIContext<
	T extends Record<string, string>,
	C extends Record<string, string> = Record<string, never>,
	PreRequest extends
		APIContextPreRequestHandler<C>[] = APIContextPreRequestHandler<C>[],
>(fn: NextRouteHandler<T>, options?: APIContextOptions<T, C>) {
	return async (request: NextRequest, ctx: { params: Promise<T> }) => {
		const middlewareContext: MergePreRequestContexts<PreRequest> = {};

		try {
			if (options?.preRequest) {
				for (const handler of options.preRequest) {
					const result = await handler(request, ctx, middlewareContext);
					if (result !== CONTINUE) {
						return result;
					}
				}
			}
			const response = await fn(request, ctx);

			return response;
		} catch (e: unknown) {
			if (e instanceof APIContextError) {
				return Response.json(e.content, { status: e.status });
			}
			throw e;
		}
	};
}
