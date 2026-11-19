import { createClient } from "@supabase/supabase-js";

export default async function Dashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("orders").select("*");
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
