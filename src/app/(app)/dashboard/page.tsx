import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0];
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];

  const [intentRes, focusRes, commitmentsRes, habitsRes, logsRes] = await Promise.all([
    supabase
      .from("essential_intents")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("daily_focus")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single(),
    supabase
      .from("commitments")
      .select("id, title, requester, score, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("habit_templates")
      .select("id, name, icon, sort_order")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order")
      .limit(6),
    supabase
      .from("habit_logs")
      .select("habit_id, date, done")
      .eq("user_id", user.id)
      .gte("date", twoWeeksAgoStr)
      .eq("done", true),
  ]);

  // Compute streaks
  const logs = logsRes.data ?? [];
  const habitsWithStreak = (habitsRes.data ?? []).map((h) => {
    const doneDates = new Set(logs.filter((l) => l.habit_id === h.id).map((l) => l.date));
    let streak = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (doneDates.has(ds)) streak++;
      else break;
    }
    const doneToday = doneDates.has(today);
    return { ...h, streak, done_today: doneToday };
  });

  return (
    <DashboardClient
      activeIntent={intentRes.data}
      todayFocus={focusRes.data}
      pendingCommitments={commitmentsRes.data ?? []}
      habits={habitsWithStreak}
      today={today}
    />
  );
}
