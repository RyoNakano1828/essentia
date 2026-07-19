import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DailyFocusClient } from "./daily-focus-client";

export default async function DailyFocusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0];

  const [focusRes, intentRes] = await Promise.all([
    supabase
      .from("daily_focus")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single(),
    supabase
      .from("essential_intents")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
  ]);

  return (
    <DailyFocusClient
      todayFocus={focusRes.data}
      activeIntent={intentRes.data}
      today={today}
    />
  );
}
