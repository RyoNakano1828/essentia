import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";
import { startOfWeek, endOfWeek, format } from "date-fns";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const weekOffset = parseInt(searchParams.get("offset") ?? "0");

  const refDate = new Date();
  refDate.setDate(refDate.getDate() - weekOffset * 7);

  const weekStart = format(startOfWeek(refDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd   = format(endOfWeek(refDate,   { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [focusRes, habitsRes, logsRes, intentRes] = await Promise.all([
    supabase
      .from("daily_focus")
      .select("date, essential_task, completed, perma_positive, perma_meaning, perma_achieve, reflection")
      .eq("user_id", user.id)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("date"),
    supabase
      .from("habit_templates")
      .select("id, name, icon")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("habit_logs")
      .select("habit_id, date, done")
      .eq("user_id", user.id)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .eq("done", true),
    supabase
      .from("essential_intents")
      .select("title")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
  ]);

  const focusData = focusRes.data ?? [];
  const habits    = habitsRes.data ?? [];
  const logs      = logsRes.data ?? [];

  // Compute focus completion rate
  const completedCount = focusData.filter((f) => f.completed).length;
  const focusRate = focusData.length > 0 ? Math.round((completedCount / focusData.length) * 100) : 0;

  // Compute habit completion per habit
  const habitStats = habits.map((h) => {
    const doneDays = logs.filter((l) => l.habit_id === h.id).length;
    return { ...h, done_days: doneDays };
  }).sort((a, b) => b.done_days - a.done_days);

  // Average PERMA scores
  const meaningScores = focusData.map((f) => f.perma_meaning).filter(Boolean) as number[];
  const avgMeaning = meaningScores.length > 0
    ? Math.round((meaningScores.reduce((a, b) => a + b, 0) / meaningScores.length) * 10) / 10
    : null;

  // Build AI prompt
  const focusSummary = focusData.map((f) =>
    `${f.date}：${f.essential_task}（${f.completed ? "✓" : "✗"}）` +
    (f.perma_meaning ? ` 充実感${f.perma_meaning}` : "")
  ).join("\n") || "記録なし";

  const habitSummary = habitStats.map((h) =>
    `${h.icon} ${h.name}：${h.done_days}/7日`
  ).join("、") || "記録なし";

  const prompt = `今週（${weekStart}〜${weekEnd}）の自動ウィークリーサマリーを生成してください。

インテント：「${intentRes.data?.title || "未設定"}」

デイリーフォーカス達成率：${focusRate}%（${completedCount}/${focusData.length}日）
${focusSummary}

習慣実績：${habitSummary}
平均充実感スコア（第19章）：${avgMeaning ?? "データなし"} / 5

以下の構成で簡潔に（300文字以内）：
1. 今週のインテントへの前進度
2. 最も良かった点と要改善点（各1行）
3. 来週のエッセンシャルアクション（第17章）を「→ 来週：○○」で締める`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 450,
  });

  const aiSummary = response.choices[0]?.message?.content ?? "";

  return NextResponse.json({
    week_start: weekStart,
    week_end: weekEnd,
    focus_completion_rate: focusRate,
    completed_days: completedCount,
    total_days: focusData.length,
    top_habits: habitStats.slice(0, 3).map((h) => ({ name: h.name, icon: h.icon, done_days: h.done_days })),
    avg_meaning: avgMeaning,
    ai_summary: aiSummary,
  });
}
