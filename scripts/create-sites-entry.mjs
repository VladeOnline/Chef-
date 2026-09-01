import { mkdir, writeFile } from "node:fs/promises";

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
