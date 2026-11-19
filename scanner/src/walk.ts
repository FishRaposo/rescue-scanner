/**
 * Repository walker: collects source files and classifies each into the
 * Next.js/Supabase roles the rules understand.
 *
 * Classification heuristics (documented in docs/RULES.md):
 *  - `app/api/.../route.ts(x)` or `pages/api/**`               → route-handler
 *  - `** /migrations/**.sql` or `supabase/**.sql`              → sql-migration
 *  - `.env.example` / `.env.sample`                           → env-example
 *  - `*.{test,spec}.{ts,tsx,js,jsx}` or `__tests__/**`         → test
 *  - starts with `"use client"`                               → client-component
 *  - `.ts/.tsx` under `app/`                                   → server-component
 *  - any other `.ts/.tsx/.js/.jsx/.sql`                       → source
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import type { FileKind, RepoContext, SourceFile } from "./types.ts";

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "out", "dist", "build", "coverage",
  ".turbo", ".vercel", "__pycache__", ".venv", "venv",
]);

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql"]);
const MAX_FILE_BYTES = 512 * 1024;

export function classify(pathInRepo: string, text: string): FileKind {
  const p = pathInRepo.replace(/\\/g, "/");
  const base = p.slice(p.lastIndexOf("/") + 1);
  if (/(^|\/)app\/api\/.+\/route\.(t|j)sx?$/.test(p) || /(^|\/)pages\/api\//.test(p)) return "route-handler";
  if (/\.sql$/.test(base) && /(^|\/)(supabase|migrations|db|database)\//.test(p)) return "sql-migration";
  if (/^\.env\.(example|sample|template)/.test(base)) return "env-example";
  if (/(^|\/)__tests__\//.test(p) || /\.(test|spec)\.[tj]sx?$/.test(base)) return "test";
  if (/^\s*["']use client["']/.test(text)) return "client-component";
  if (/(^|\/)app\//.test(p)) return "server-component";
  return SOURCE_EXT.has(path.extname(base)) ? "source" : "other";
}

export function lineStartsOf(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return starts;
}

function gitRevision(root: string): string | null {
  try {
    const out = execFileSync("git", ["-C", root, "rev-parse", "--short=8", "HEAD"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

export function walk(root: string): RepoContext {
  const files: SourceFile[] = [];
  const paths = new Set<string>();

  const visit = (dir: string, rel: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") && entry.name !== ".env.example" && entry.name !== ".env.sample" && entry.name !== ".env.template") continue;
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) visit(full, relPath);
        continue;
      }
      paths.add(relPath);
      const ext = path.extname(entry.name);
      if (!SOURCE_EXT.has(ext) && !/^\.env\./.test(entry.name)) continue;
      const st = statSync(full);
      if (st.size > MAX_FILE_BYTES) continue;
      let text: string;
      try {
        text = readFileSync(full, "utf-8");
      } catch {
        continue;
      }
      const kind = classify(relPath, text);
      files.push({
        path: relPath,
        text,
        kind,
        isClient: kind === "client-component",
        lineStarts: lineStartsOf(text),
      });
    }
  };

  visit(root, "");
  files.sort((a, b) => a.path.localeCompare(b.path));
  return { root, revision: gitRevision(root), files, paths };
}
