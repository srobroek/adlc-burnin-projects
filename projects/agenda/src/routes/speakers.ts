import type { Catalog } from "../agenda/catalog.ts";
import { json, notImplemented } from "../http.ts";

export function speakerRoutes(catalog: Catalog) {
  return {
    "/speakers": { GET: () => json(catalog.speakers()) },
    "/speakers/:id": { GET: () => notImplemented("speaker-profile") },
  };
}
