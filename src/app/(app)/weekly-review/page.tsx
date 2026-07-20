import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeeklyReviewClient } from "./weekly-review-client";
import { startOfWeek, endOfWeek, format } from "date-fns";

export default async function WeeklyReviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [reviewRes, intentRes, recentRes] = await Promise.all([
    supabase
      .from("weekly_reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single(),
    supabase
      .from("essential_intents")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("weekly_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(4),
  ]);

  return (
    <WeeklyReviewClient
      currentReview={reviewRes.data}
      activeIntent={intentRes.data}
      recentReviews={recentRes.data ?? []}
      weekStart={weekStart}
      weekEnd={weekEnd}
    />
  );
}
