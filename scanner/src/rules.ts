/**
 * The eight MVP rules. Each is deliberately simple and evidence-backed: a
 * finding always names the file and line it came from, and docs/RULES.md
 * documents what the rule cannot see.
 */
import {
  lineOf,
  matches,
  finding,
  type Finding,
  type RepoContext,
  type Rule,
  type SourceFile,
} from "./types.ts";

const SECRET_WORDS = /SERVICE_ROLE|SECRET|PRIVATE|API_KEY|TOKEN|PASSWORD|CREDENTIAL/i;
/** Env names Next.js/Node provide; never a repo defect. */
const RUNTIME_ENV = new Set(["NODE_ENV", "PORT", "VERCEL", "VERCEL_ENV", "VERCEL_URL", "CI"]);

export const serverSecretInClient: Rule = {
  id: "server-secret-in-client",
  title: "Server secret reachable from client code",
  severity: "high",
  confidence: "high",
  description:
    "A secret-shaped env key is either inlined into the client bundle via NEXT_PUBLIC_* or referenced inside a client component.",
  checkFile(file: SourceFile): Finding[] {
    if (file.kind === "test" || file.kind === "env-example") return [];
    const out: Finding[] = [];
    // NEXT_PUBLIC_ prefix on a secret-looking name ships it in the bundle.
    for (const [off, m] of matches(file, /NEXT_PUBLIC_([A-Z0-9_]*SECRET[A-Z0-9_]*|[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*|[A-Z0-9_]*PRIVATE[A-Z0-9_]*|[A-Z0-9_]*TOKEN[A-Z0-9_]*)\b/g)) {
      out.push(finding(file, this, off, {
        remediation: `Rename the env key to drop the NEXT_PUBLIC_ prefix (it is bundled to the browser): use a server-only name like ${m[1]!} and read it in a route handler or server component.`,
      }));
    }
    // Secret-shaped env read inside a client component.
    if (file.isClient) {
      for (const [off, m] of matches(file, /process\.env\.([A-Z0-9_]+)/g)) {
        if (SECRET_WORDS.test(m[1]!) && !m[1]!.startsWith("NEXT_PUBLIC_")) {
          out.push(finding(file, this, off, {
            remediation: `Move the ${m[1]!} access into a route handler or server component; anything read in a client file is shipped to every browser.`,
          }));
        }
      }
    }
    return out;
  },
};

export const missingRls: Rule = {
  id: "missing-rls",
  title: "Supabase table without row-level security",
  severity: "high",
  confidence: "medium",
  description:
    "A CREATE TABLE in a Supabase migration without ALTER TABLE ... ENABLE ROW LEVEL SECURITY, or a policy USING (true).",
  checkFile(file: SourceFile): Finding[] {
    if (file.kind !== "sql-migration") return [];
    const out: Finding[] = [];
    const lower = file.text.toLowerCase();
    for (const [off, m] of matches(file, /create\s+table\s+(?:if\s+not\s+exists\s+)?["'`]?([\w.]+)["'`]?/gi)) {
      const table = m[1]!.split(".").pop()!.replace(/["'`]/g, "");
      // RLS enabled anywhere for this table name?
      const enable = new RegExp(`alter\\s+table\\s+(?:if\\s+exists\\s+)?(?:public\\.)?["'\`]?${table}["'\`]?\\s+enable\\s+row\\s+level\\s+security`, "i");
      if (!enable.test(lower)) {
        out.push(finding(file, this, off, {
          remediation: `Add ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY; plus a policy scoped to the owning user, e.g. USING (auth.uid() = user_id).`,
        }));
      }
    }
    for (const [off] of matches(file, /using\s*\(\s*true\s*\)/gi)) {
      out.push(finding(file, this, off, {
        severity: "high",
        confidence: "high",
        remediation: "USING (true) grants the action to every role including anon. Replace with a user-scoped predicate such as USING (auth.uid() = user_id).",
      }));
    }
    return out;
  },
};

const AUTH_CALL = /\b(getSession|getUser|requireAuth|requireUser|auth\s*\(|currentUser|protect|withAuth|redirect\s*\(\s*["'`]\/login)/;

export const missingAuthCheck: Rule = {
  id: "missing-auth-check",
  title: "Protected route without a session check",
  severity: "medium",
  confidence: "medium",
  description:
    "A page or route handler under a protected prefix (app/dashboard, app/admin, app/account, app/(protected)) with no session/user check in its file or a sibling layout.",
  checkFile(file: SourceFile, ctx: RepoContext): Finding[] {
    if (file.kind !== "server-component" && file.kind !== "route-handler") return [];
    const protectedPrefix = /(^|\/)app\/(dashboard|admin|account|settings|profile|\(protected\)|\(authed\))\//;
    if (!protectedPrefix.test(file.path)) return [];
    // A sibling layout.tsx that checks auth covers the whole subtree.
    const dir = file.path.slice(0, file.path.lastIndexOf("/"));
    const chain = dir.split("/");
    for (let i = chain.length; i >= 1; i--) {
      const layout = ctx.files.find((f) => f.path === `${chain.slice(0, i).join("/")}/layout.tsx`);
      if (layout && AUTH_CALL.test(layout.text)) return [];
    }
    if (AUTH_CALL.test(file.text) || /middleware/i.test(file.text)) return [];
    const off = file.text.length ? 0 : 0;
    return [
      finding(file, this, off, {
        remediation:
          "Check the session at the top of the handler/page or in the route-group layout: const { data: { session } } = await supabase.auth.getSession(); if (!session) redirect('/login').",
      }),
    ];
  },
};

const INPUT_VALIDATE = /\b(safeParse|zod|z\.object|validate|schema\.parse|ajv|yup\.|superstruct|typebox)/i;
const READS_BODY = /\b(request|req)\.json\(\)|await\s+(request|req)\.(json|formData|text)\(/;

export const unsafeApiRoute: Rule = {
  id: "unsafe-api-route",
  title: "Route handler consumes unvalidated input",
  severity: "medium",
  confidence: "medium",
  description:
    "A POST/PUT/PATCH/DELETE route handler reads request.json()/formData() and uses it without a schema/validation call.",
  checkFile(file: SourceFile): Finding[] {
    if (file.kind !== "route-handler") return [];
    if (!/export\s+(async\s+)?function\s+(POST|PUT|PATCH|DELETE)\b/.test(file.text) && !/export\s+const\s+(POST|PUT|PATCH|DELETE)\b/.test(file.text)) return [];
    if (!READS_BODY.test(file.text)) return [];
    if (INPUT_VALIDATE.test(file.text)) return [];
    const m = file.text.search(READS_BODY);
    return [
      finding(file, this, m, {
        remediation:
          "Validate the body before use: const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: 'invalid input' }, { status: 400 });",
      }),
    ];
  },
};

const SERVER_ONLY_IMPORT = /from\s+["'](node:fs|fs|child_process|server-only|[^"']*\/lib\/server|[^"']*\/server|prisma|@prisma\/client|next\/headers|supabase\/server|pg|mysql2|drizzle-orm\/node-postgres)["']|require\(\s*["'](fs|child_process)["']/;

export const boundaryLeak: Rule = {
  id: "boundary-leak",
  title: "Server-only module imported into client code",
  severity: "high",
  confidence: "high",
  description:
    "A client component imports a server-only module (fs, next/headers, a server lib, a DB client): the import either breaks the build or leaks server code into the bundle.",
  checkFile(file: SourceFile): Finding[] {
    if (!file.isClient) return [];
    const out: Finding[] = [];
    for (const [off, m] of matches(file, new RegExp(SERVER_ONLY_IMPORT.source, "g"))) {
      out.push(finding(file, this, off, {
        remediation: `Remove the server import (${m[1]!.slice(0, 60)}) from the client file; call a route handler or pass the data in from a server component instead.`,
      }));
    }
    return out;
  },
};

const TEST_BASENAME = /\.(test|spec)\.[tj]sx?$/;

export const missingTest: Rule = {
  id: "missing-test",
  title: "Critical flow with no test file",
  severity: "low",
  confidence: "medium",
  description:
    "Each route handler should have a test/spec file named after its directory (e.g. app/api/pay/route.ts ↔ pay.test.ts) somewhere in the repo.",
  checkRepo(ctx: RepoContext): Finding[] {
    const testNames = ctx.files
      .filter((f) => f.kind === "test")
      .map((f) => f.path.slice(f.path.lastIndexOf("/") + 1).replace(TEST_BASENAME, ""));
    const out: Finding[] = [];
    for (const f of ctx.files) {
      if (f.kind !== "route-handler") continue;
      const dir = f.path.slice(0, f.path.lastIndexOf("/"));
      const name = dir.slice(dir.lastIndexOf("/") + 1);
      if (!testNames.includes(name)) {
        out.push(finding(f, this, 0, {
          remediation: `Add ${name}.test.ts exercising the handler's happy path and one rejection case (e.g. vitest: const res = await POST(new Request(...))).`,
        }));
      }
    }
    return out;
  },
};

const LOCALHOST = /localhost|127\.0\.0\.1|0\.0\.0\.0/;

export const deployMisconfig: Rule = {
  id: "deploy-misconfig",
  title: "Hard-coded local URL or unsafe http endpoint",
  severity: "medium",
  confidence: "high",
  description:
    "A committed source file hard-codes localhost/127.0.0.1 or an http:// URL that will break or leak in production.",
  checkFile(file: SourceFile): Finding[] {
    if (file.kind === "test" || file.kind === "env-example") return [];
    if (file.path.includes("mock") || file.path.includes("fixture")) return [];
    const out: Finding[] = [];
    for (const [off, m] of matches(file, /["'`](https?:\/\/[^"'`\s)]+)["'`]/g)) {
      const url = m[1]!;
      const ln = file.text.slice(
        file.lineStarts[lineOf(file, off) - 1],
        file.lineStarts[lineOf(file, off)] ?? file.text.length,
      );
      // Not defects: env-backed defaults (`env ?? "http://…"`, zod
      // `.default("…")`); a `new URL(path, base)` parse base; a URL template
      // literal containing ${…}; or a literal inside a docs/snippet string
      // (multi-line string carrying \n escapes, e.g. a <pre> install block).
      if (/process\.env|environment\.|\.default\(|new\s+URL\s*\(/.test(ln)) continue;
      if (url.includes("${") || ln.includes("\\n")) continue;
      if (LOCALHOST.test(url) || url.startsWith("http://")) {
        if (url.startsWith("http://") && !LOCALHOST.test(url) && /\.(w3\.org|jsonplaceholder|example\.com)/.test(url)) continue;
        out.push(finding(file, this, off, {
          remediation: `Move "${url.slice(0, 60)}" into an env key (e.g. process.env.APP_BASE_URL) with .env.example documenting it; keep https for any remote endpoint.`,
        }));
      }
    }
    for (const [off] of matches(file, /basePath\s*:\s*["'`]\//g)) {
      out.push(finding(file, this, off, {
        severity: "low",
        remediation: "next.config basePath is committed; verify it matches the deployment path or remove it.",
      }));
    }
    return out;
  },
};

export const envMisconfig: Rule = {
  id: "env-misconfig",
  title: "Env key used in code missing from .env.example",
  severity: "low",
  confidence: "medium",
  description:
    "process.env.KEY referenced in source with no matching key in .env.example/.env.sample — a fresh deploy fails or silently skips config.",
  checkRepo(ctx: RepoContext): Finding[] {
    const envFile = ctx.files.find((f) => f.kind === "env-example");
    const declared = new Set<string>();
    if (envFile) {
      for (const line of envFile.text.split("\n")) {
        // Uncommented declarations and commented optional ones (# KEY=) both
        // document the key to a fresh clone.
        const m = /^\s*(?:#\s*)?(?:export\s+)?([A-Z0-9_]+)\s*=/.exec(line);
        if (m) declared.add(m[1]!);
      }
    }
    const seen = new Map<string, { file: SourceFile; off: number }>();
    for (const f of ctx.files) {
      if (f.kind === "test" || f.kind === "env-example") continue;
      // Tooling dirs are not product code; their keys don't gate a deploy.
      if (/(^|\/)(scripts|tools|bin)\//.test(f.path)) continue;
      for (const [off, m] of matches(f, /process\.env\.([A-Z0-9_]{3,})/g)) {
        const key = m[1]!;
        if (RUNTIME_ENV.has(key) || declared.has(key) || seen.has(key)) continue;
        seen.set(key, { file: f, off });
      }
    }
    const out: Finding[] = [];
    for (const [key, hit] of [...seen.entries()].sort()) {
      const hasEnvExample = envFile !== undefined;
      if (!hasEnvExample && key.startsWith("NEXT_PUBLIC_")) {
        // No example file at all is a finding on its own only for secret-shaped keys.
        if (!SECRET_WORDS.test(key)) continue;
      }
      if (!hasEnvExample && !SECRET_WORDS.test(key) && seen.size > 12) continue;
      out.push(finding(hit.file, this, hit.off, {
        remediation: hasEnvExample
          ? `Add ${key}= to .env.example so a fresh clone knows the key is required.`
          : `Create .env.example listing ${key} and the other required keys; code reads it but nothing documents it.`,
      }));
    }
    return out;
  },
};

export const RULES: Rule[] = [
  serverSecretInClient,
  missingRls,
  boundaryLeak,
  unsafeApiRoute,
  missingAuthCheck,
  deployMisconfig,
  envMisconfig,
  missingTest,
];
