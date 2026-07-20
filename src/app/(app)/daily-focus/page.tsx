import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DailyFocusClient } from "./daily-focus-client";

export default async function DailyFocusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0];

  const [focusRes, intentRes, habitsRes, logsRes] = await Promise.all([
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
    supabase
      .from("habit_templates")
      .select("id, name, icon, category")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("habit_logs")
      .select("habit_id, done, id")
      .eq("user_id", user.id)
      .eq("date", today),
  ]);

  const habitsWithStatus = (habitsRes.data ?? []).map((h) => ({
    ...h,
    done: logsRes.data?.find((l) => l.habit_id === h.id)?.done ?? false,
    log_id: logsRes.data?.find((l) => l.habit_id === h.id)?.id ?? null,
  }));

  return (
    <DailyFocusClient
      todayFocus={focusRes.data}
      activeIntent={intentRes.data}
      today={today}
      habits={habitsWithStatus}
    />
  );
}
