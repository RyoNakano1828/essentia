import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MigrateClient } from "./migrate-client";

export default async function MigratePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch user's habit templates to use as mapping targets
  const { data: habits } = await supabase
    .from("habit_templates")
    .select("id, name, icon, category")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order");

  return <MigrateClient habits={habits ?? []} />;
}
