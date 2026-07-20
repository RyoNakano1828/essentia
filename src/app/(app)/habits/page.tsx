import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HabitsClient } from "./habits-client";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0];

  // Fetch active habits
  const { data: habits } = await supabase
    .from("habit_templates")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order");

  // Fetch today's logs
  const { data: todayLogs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today);

  // Fetch last 14 days of logs to compute streaks
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
  const { data: recentLogs } = await supabase
    .from("habit_logs")
    .select("habit_id, date, done")
    .eq("user_id", user.id)
    .gte("date", twoWeeksAgo.toISOString().split("T")[0])
    .eq("done", true);

  // Compute streak per habit
  const habitIds = habits?.map((h) => h.id) ?? [];
  const streakMap: Record<string, number> = {};
  for (const habitId of habitIds) {
    const doneDates = new Set(
      (recentLogs ?? [])
        .filter((l) => l.habit_id === habitId)
        .map((l) => l.date)
    );
    let streak = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (doneDates.has(ds)) streak++;
      else break;
    }
    streakMap[habitId] = streak;
  }

  const habitsWithStatus = (habits ?? []).map((h) => ({
    ...h,
    streak: streakMap[h.id] ?? 0,
    done_today: todayLogs?.some((l) => l.habit_id === h.id && l.done) ?? false,
    log_id: todayLogs?.find((l) => l.habit_id === h.id)?.id ?? null,
  }));

  return <HabitsClient habits={habitsWithStatus} today={today} />;
}
