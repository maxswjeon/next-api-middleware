import { withAPIContext } from "@/lib/api";

import { withSession } from "@/lib/middleware";

type Params = {
	userId: string;
};

export const GET = withAPIContext<Params>(async (req, ctx) => {
	const session = withSession();

	return Response.json({});
});
