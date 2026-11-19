import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@shared/ui";
import { api } from "../../../lib/api";
import { findingsBySlug, RULE_LIMITS, type Finding } from "../../../lib/report";

/** Static export: one page per finding slug. */
export function generateStaticParams() {
  return [...findingsBySlug.keys()].map((slug) => ({ slug }));
}

const PATCHES: Record<string, string> = {
  "missing-rls": `-- before
create table orders (id uuid primary key, user_id uuid, ...);

-- after
create table orders (id uuid primary key, user_id uuid, ...);
alter table orders enable row level security;
create policy "owner reads orders" on orders
  for select using (auth.uid() = user_id);`,
  "server-secret-in-client": `// before (client component)
const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// after — keep the secret server-side; the client calls a route handler
const res = await fetch("/api/pay", { method: "POST", body: JSON.stringify(input) });`,
  "unsafe-api-route": `// before
const body = await request.json();
await supabase.from("orders").insert(body);

// after
const parsed = OrderInput.safeParse(await request.json());
if (!parsed.success) return Response.json({ error: "invalid input" }, { status: 400 });
await supabase.from("orders").insert(parsed.data);`,
  "boundary-leak": `// before (client component)
import { readFileSync } from "fs";

// after — the client file calls the API; the server file owns fs
const res = await fetch("/api/export");`,
  "deploy-misconfig": `// before
const res = await fetch("http://localhost:4000/send", ...);

// after
const res = await fetch(\`\${process.env.NOTIFY_BASE_URL}/send\`, ...);
// .env.example gains: NOTIFY_BASE_URL=`,
  "env-misconfig": `# before — code reads the key, nothing documents it
process.env.STRIPE_WEBHOOK_SECRET

# after — .env.example gains
STRIPE_WEBHOOK_SECRET=`,
  "missing-auth-check": `// add to app/dashboard/layout.tsx
const { data: { session } } = await supabase.auth.getSession();
if (!session) redirect("/login");`,
  "missing-test": `// pay.test.ts
import { POST } from "../app/api/pay/route";
it("rejects invalid input", async () => {
  const res = await POST(new Request("http://x", { method: "POST", body: "{}" }));
  expect(res.status).toBe(400);
});`,
};

export default async function FindingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findingsBySlug.has(slug)) notFound();
  const f = await api.get<Finding>(`/api/scan/findings/${slug}`);
  return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm">
          <Link prefetch={false} href="/" className="text-blue-700 underline">
            ← all findings
          </Link>
        </p>
        <h1 className="mt-4 text-xl font-semibold">{f.title}</h1>
        <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted">rule</dt>
          <dd>
            <code>{f.ruleId}</code>
          </dd>
          <dt className="text-muted">severity</dt>
          <dd className="uppercase">{f.severity}</dd>
          <dt className="text-muted">confidence</dt>
          <dd>{f.confidence}</dd>
          <dt className="text-muted">location</dt>
          <dd>
            <code>
              {f.path}:{f.line}
            </code>
          </dd>
        </dl>
        <h2 className="mt-6 font-semibold">Evidence</h2>
        <CodeBlock>{f.evidence}</CodeBlock>
        <h2 className="mt-6 font-semibold">Suggested remediation</h2>
        <p className="text-sm">{f.remediation}</p>
        {PATCHES[f.ruleId] ? (
          <>
            <h2 className="mt-6 font-semibold">Suggested patch</h2>
            <CodeBlock>{PATCHES[f.ruleId]}</CodeBlock>
          </>
        ) : null}
        <div className="mt-6 rounded-md border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>What this rule cannot see:</strong>{" "}
          {RULE_LIMITS[f.ruleId] ?? "Heuristic rule; verify against the real code before acting."}
        </div>
      </main>
    );
}
