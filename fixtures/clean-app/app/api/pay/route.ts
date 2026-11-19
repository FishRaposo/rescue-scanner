import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const OrderInput = z.object({
  amount_cents: z.number().int().positive(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const parsed = OrderInput.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "invalid input" }, { status: 400 });
  }
  const supabase = createClient(
    "https://example.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await supabase.from("orders").insert(parsed.data);
  return Response.json({ ok: true });
}
