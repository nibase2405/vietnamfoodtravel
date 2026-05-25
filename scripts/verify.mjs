import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceExt = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".sql", ".md"]);
const issues = [];

function walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (["node_modules", ".next", ".git"].includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if ([...sourceExt].some((ext) => full.endsWith(ext))) checkFile(full);
  }
}

function checkFile(file) {
  const text = readFileSync(file, "utf8");
  const rel = relative(root, file);
  const badPatterns = [
    /\?\/label/,
    /h-35/,
    /<h1[^>]*>[^<]*\/h1>/,
    /pageMetadata\(\{[^}]*description:\s*"[^"]*path:/,
    /[\uE000-\uF8FF]/
  ];

  for (const pattern of badPatterns) {
    if (pattern.test(text)) issues.push(`${rel}: suspicious pattern ${pattern}`);
  }

  if (file.endsWith(".json")) {
    try {
      JSON.parse(text);
    } catch (error) {
      issues.push(`${rel}: invalid JSON: ${error.message}`);
    }
  }

  if (file.endsWith(".tsx") || file.endsWith(".ts")) {
    const useClientIndex = text.indexOf('"use client"');
    const firstImportIndex = text.indexOf("import ");
    if (useClientIndex > 0 && firstImportIndex >= 0 && useClientIndex > firstImportIndex) {
      issues.push(`${rel}: "use client" must be before imports`);
    }
    if (text.includes("searchParams }: { searchParams?: {")) {
      issues.push(`${rel}: Next App Router searchParams should be async or omitted`);
    }
  }
}

walk(root);

if (issues.length) {
  console.error(`Verification failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Verification passed");
