import * as esbuild from "esbuild";

let ctx = await esbuild.context({
  entryPoints: ["src/index.ts"],
  outbase: "src",
  bundle: true,
  platform: "node",
  target: ["node16"],
  outdir: "dist",
  format: "esm",

  sourcemap: true,
  packages: "external",
});

await ctx.watch();
console.log("watching...");
