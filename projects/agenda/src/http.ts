/** JSON response helpers shared by every route module. */

export const json = (body: unknown, status = 200): Response => Response.json(body, { status });

export const notFound = (what: string): Response =>
  json({ error: "not_found", message: `${what} not found` }, 404);

export const badRequest = (message: string): Response =>
  json({ error: "bad_request", message }, 400);

/** Placeholder for an endpoint whose ledger item is not done yet. */
export const notImplemented = (feature: string): Response =>
  json({ error: "not_implemented", feature }, 501);
