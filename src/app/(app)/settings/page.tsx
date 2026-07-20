import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { count } = await supabase
    .from("habit_templates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return <SettingsClient userEmail={user.email ?? ""} hasHabits={(count ?? 0) > 0} />;
}
