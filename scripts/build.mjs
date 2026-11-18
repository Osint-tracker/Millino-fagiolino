import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
await mkdir("study/vendor", { recursive: true });
for (const module of ["pdf", "pdf.worker"])
  await cp(
    "node_modules/pdfjs-dist/legacy/build/" + module + ".min.mjs",
    "study/vendor/" + module + ".mjs",
  );
await mkdir("dist", { recursive: true });
await cp("study", "dist", { recursive: true });
await build({
  entryPoints: ["scripts/native.mjs"],
  bundle: true,
  format: "iife",
  minify: true,
  outfile: "dist/native.js",
});
await writeFile(
  "dist/index.html",
  (await readFile("dist/index.html", "utf8")).replace(
    "<head>",
    '<head><meta name="packaged" content="true"><script src="native.js"></script>',
  ),
);
const hash = createHash("sha256");
for (const name of (await readdir("dist")).sort()) {
  if (/\.(js|mjs|css|html|webmanifest|svg|png)$/.test(name))
    hash.update(await readFile("dist/" + name));
}
for (const name of ["pdf", "pdf.worker"])
  hash.update(await readFile("dist/vendor/" + name + ".mjs"));
const worker = (await readFile("dist/sw.js", "utf8"))
  .replace(
    /mirees-study-shell-[\w-]+/,
    "mirees-study-shell-" + hash.digest("hex").slice(0, 16),
  )
  .replace(
    /const files\s*=\s*\[/,
    "const files=['./native.js','./vendor/pdf.mjs','./vendor/pdf.worker.mjs',",
  );
await writeFile("dist/sw.js", worker);
await mkdir("dist/legacy", { recursive: true });
for (const file of ["index.html", "js", "jesse"])
  await cp(file, "dist/legacy/" + file, { recursive: true });
