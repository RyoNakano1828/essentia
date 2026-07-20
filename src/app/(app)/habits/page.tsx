import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HabitsClient } from "./habits-client";

export default async function HabitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [habitsRes, settingsRes] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("is_essential", { ascending: false }),
    supabase
      .from("user_settings")
      .select("notion_access_token, notion_workspace_name")
      .eq("user_id", user.id)
      .single(),
  ]);

  return (
    <HabitsClient
      habits={habitsRes.data ?? []}
      hasNotionToken={!!settingsRes.data?.notion_access_token}
      notionWorkspace={settingsRes.data?.notion_workspace_name ?? null}
    />
  );
}
