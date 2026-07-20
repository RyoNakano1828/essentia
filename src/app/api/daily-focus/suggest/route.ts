import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { activeIntent } = await request.json();

  // Fetch recent daily focus for context (last 7 days)
  const { data: recentFocus } = await supabase
    .from("daily_focus")
    .select("date, essential_task, completed, reflection")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(7);

  // Fetch essential habits
  const { data: essentialHabits } = await supabase
    .from("habits")
    .select("name")
    .eq("user_id", user.id)
    .eq("is_essential", true);

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("ja-JP", { weekday: "long" });
  const hour = today.getHours();
  const timeOfDay =
    hour < 12 ? "朝" : hour < 17 ? "昼" : "夕方";

  const recentPattern = recentFocus
    ?.map(
      (f: { date: string; essential_task: string; completed: boolean; reflection: string | null }) =>
        `${f.date}（${f.completed ? "✓" : "✗"}）：${f.essential_task}`
    )
    .join("\n");

  const lastReflection = recentFocus?.[0]?.reflection;
  const lastCompleted = recentFocus?.[0]?.completed;
  const consecutiveIncomplete = recentFocus
    ? recentFocus.filter((f: { completed: boolean }) => !f.completed).length
    : 0;

  const prompt = `今日（${dayOfWeek}・${timeOfDay}）のデイリーフォーカスを設定します（第5章：孤独、第17章：前進、第19章：集中）。

━━━ ユーザーのコンテキスト ━━━
インテント（第10章）：「${activeIntent?.title || "未設定"}」
守るべき習慣（第18章）：${essentialHabits?.length ? essentialHabits.map((h: { name: string }) => h.name).join("、") : "なし"}

直近7日のデイリーフォーカス（第17章：前進のモメンタム）：
${recentPattern || "記録なし"}
${lastReflection ? `\n昨日の振り返り：「${lastReflection}」` : ""}

${consecutiveIncomplete >= 3 ? `⚠️ ${consecutiveIncomplete}日連続で未完了です。目標の難易度を下げることを考えてみましょう（第17章：最小限の実行可能な進歩）。` : ""}
${lastCompleted === false && !lastReflection ? "⚠️ 昨日のエッセンシャルが未完了です。今日の目標を設定する前に、何が邪魔したか考えてみましょう（第16章：削減）。" : ""}

━━━ 指示 ━━━
第19章（集中）の問い「今、何が重要か？」をユーザーに問いかけながら、
インテントに最も近づく今日の本質的な1アクションを提案してください。

提案は「最小限の実行可能な進歩（第17章）」として、今日の${timeOfDay}から実行可能な具体的なものにしてください。
温かみのある口調で、200文字以内で。`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.8,
    max_tokens: 280,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
