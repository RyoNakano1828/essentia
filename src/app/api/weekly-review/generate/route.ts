import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { weekStart, weekEnd, activeIntent } = await request.json();

  // Fetch this week's daily focus
  const { data: weekFocus } = await supabase
    .from("daily_focus")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", weekStart)
    .lte("date", weekEnd);

  // Fetch commitments evaluated this week
  const { data: weekCommitments } = await supabase
    .from("commitments")
    .select("title, score, status, ai_verdict")
    .eq("user_id", user.id)
    .gte("created_at", weekStart)
    .lte("created_at", weekEnd + "T23:59:59");

  // Fetch last 3 weekly reviews to detect repeating patterns
  const { data: recentReviews } = await supabase
    .from("weekly_reviews")
    .select("time_thief, week_start")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(3);

  const completedFocus = weekFocus?.filter((f) => f.completed) ?? [];
  const completionRate = weekFocus?.length
    ? Math.round((completedFocus.length / weekFocus.length) * 100)
    : 0;

  const focusSummary = weekFocus?.length
    ? weekFocus
        .map(
          (f) =>
            `${f.date}: ${f.essential_task}（${f.completed ? "✓完了" : "未完了"}）`
        )
        .join("\n")
    : "記録なし";

  const commitmentSummary = weekCommitments?.length
    ? weekCommitments
        .map(
          (c: { title: string; score: number | null; status: string }) =>
            `・${c.title}（${c.score !== null ? c.score + "点" : "評価なし"} → ${c.status === "accepted" ? "引き受け" : "断った"}）`
        )
        .join("\n")
    : "なし";

  const repeatingTimeThieves = recentReviews
    ?.map((r: { time_thief: string | null }) => r.time_thief)
    .filter(Boolean) ?? [];

  const prompt = `今週（${weekStart}〜${weekEnd}）のウィークリーレビュー（第6章：洞察）を実施します。

━━━ ユーザーのコンテキスト ━━━
インテント（第10章）：「${activeIntent?.title || "未設定"}」

今週のデイリーフォーカス達成率（第19章）：${weekFocus?.length ? `${weekFocus.length}日中${completedFocus.length}日完了（${completionRate}%）` : "記録なし"}
${focusSummary}

今週評価した依頼（第9章）：
${commitmentSummary}

━━━ 過去のパターン（第16章：削減）━━━
直近の「時間を奪ったもの」：${repeatingTimeThieves.length ? repeatingTimeThieves.join("、") : "初回レビュー"}

━━━ 指示 ━━━
エッセンシャル思考の観点で、今週のサマリーを書いてください：
1. インテントへの前進度（第17章：前進）
2. デイリーフォーカス達成のパターンに気づいたことがあれば
3. 「捨てるべきコミットメント（第12章：キャンセル）」のヒント
4. 来週に向けた1つのエッセンシャルアクション提案

温かみのある口調で、350文字以内で。最後に「来週のエッセンシャルアクション：〇〇」という形で締めてください。`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 500,
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
