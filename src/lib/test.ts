type Middleware<C extends Record<string, unknown>> = (c: C) => void;

type UnionToIntersection<U> = (
	U extends unknown
		? (k: U) => void
		: never
) extends (k: infer I) => void
	? I
	: never;

type Contexts<Handlers extends Middleware<Record<string, unknown>>[]> =
	UnionToIntersection<Handlers[number] extends Middleware<infer C> ? C : never>;

type Handler = <Handlers extends Middleware<Record<string, unknown>>[]>(
	fns: Handlers,
	ctx: Contexts<Handlers>,
) => void;

const fn1: Middleware<{ a: string }> = (ctx) => {};

const fn2: Middleware<{ b: string }> = (ctx) => {};

const fn3: Middleware<{ c: number }> = (ctx) => {};

const foo: Handler = (fns, ctx) => {};

foo([fn1, fn2], { a: "a", b: "b" });
