import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient(
    "https://example.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await supabase.from("orders").insert({
    amount_cents: body.amount_cents,
    email: body.email,
  });
  return Response.json({ ok: true });
}
