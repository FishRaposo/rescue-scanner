import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  return <>{children}</>;
}
