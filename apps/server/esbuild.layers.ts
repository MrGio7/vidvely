import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";

(async () => {
  await build({
    entryPoints: ["./prisma/client.ts"],
    bundle: true,
    platform: "node",
    target: ["node14"],
    outfile: ".layers/prisma/client.js",
    plugins: [
      copy({
        resolveFrom: "cwd",
        assets: {
          from: [
            "./node_modules/.prisma/client/schema.prisma", //
            "./node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node",
          ],
          to: ["./.layers/prisma"],
        },
      }),
    ],
  });
})();
