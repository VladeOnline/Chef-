import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const entry = `export default {
  async fetch(request, env) {
    if (env?.ASSETS?.fetch) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Static assets binding is not available.", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
`;

await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", entry);

await rm("dist/client", { recursive: true, force: true });
await mkdir("dist/client", { recursive: true });

const publicEntries = await readdir("dist");
const excluded = new Set(["client", "server"]);

await Promise.all(
  publicEntries
    .filter((name) => !excluded.has(name))
    .map((name) => cp(join("dist", name), join("dist/client", name), { recursive: true })),
);
