// Auto-generates src/data/product-images.json from the files present in
// public/images/products/.
//
// Workflow for adding a product photo:
//   1. Drop an image into  public/images/products/
//   2. Name it exactly after the product slug, e.g.  axion-pad-standard.jpg
//      (supported extensions: .jpg .jpeg .png .webp .avif)
//   3. Run  `npm run images`  (also runs automatically on `npm run dev` / `build`)
//
// The matching slugs come from src/data/products.json — a file whose name does
// not match any slug is reported as a warning and ignored.

import { readdirSync, writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, parse, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, "..");
const imgDir = join(projectRoot, "public", "images", "products");
const outFile = join(projectRoot, "src", "data", "product-images.json");
const productsFile = join(projectRoot, "src", "data", "products.json");

const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

// Known product slugs (for validation only).
const slugs = new Set(
  JSON.parse(readFileSync(productsFile, "utf8")).products.map((p) => p.slug),
);

if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

const map = {};
const unknown = [];

for (const file of readdirSync(imgDir)) {
  const { name, ext } = parse(file);
  if (!EXTS.includes(ext.toLowerCase())) continue;
  if (!slugs.has(name)) {
    unknown.push(file);
    continue;
  }
  map[name] = `/images/products/${file}`;
}

writeFileSync(outFile, JSON.stringify(map, null, 2) + "\n");

const found = Object.keys(map).length;
console.log(`[product-images] ${found} image(s) mapped -> src/data/product-images.json`);
for (const [slug, path] of Object.entries(map)) console.log(`  + ${slug} -> ${path}`);

const missing = [...slugs].filter((s) => !map[s]);
if (missing.length) console.log(`[product-images] no image yet for: ${missing.join(", ")}`);
if (unknown.length)
  console.log(
    `[product-images] WARNING ignored (name does not match any slug): ${unknown.join(", ")}`,
  );
