import { createApp } from "./app.ts";
import { notFound } from "./http.ts";

if (import.meta.main) {
  const server = Bun.serve({
    port: Number(Bun.env.PORT ?? 3000),
    routes: createApp(),
    fetch: () => notFound("route"),
  });
  console.log(`agenda API listening on ${server.url}`);
}
