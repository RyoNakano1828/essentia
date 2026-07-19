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

  // Fetch daily focus for the week
  const { data: weekFocus } = await supabase
    .from("daily_focus")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", weekStart)
    .lte("date", weekEnd);

  // Fetch commitments from this week
  const { data: weekCommitments } = await supabase
    .from("commitments")
    .select("title, score, status")
    .eq("user_id", user.id)
    .gte("created_at", weekStart)
    .lte("created_at", weekEnd + "T23:59:59");

  const focusSummary = weekFocus
    ? weekFocus
        .map(
          (f) =>
            `${f.date}: ${f.essential_task}（${f.completed ? "✓完了" : "未完了"}）`
        )
        .join("\n")
    : "記録なし";

  const commitmentSummary = weekCommitments
    ? weekCommitments
        .map((c) => `${c.title}（${c.score}点 → ${c.status}）`)
        .join("\n")
    : "評価なし";

  const prompt = `今週（${weekStart}〜${weekEnd}）のウィークリーレビューサマリーを生成してください。

${activeIntent ? `インテント：「${activeIntent.title}」` : ""}

今週のデイリーフォーカス：
${focusSummary}

今週評価した依頼：
${commitmentSummary}

以下の観点でサマリーを書いてください：
1. 今週インテントにどれだけ近づけたか
2. デイリーフォーカスの達成率
3. 来週に向けた1つの提案

温かみのある口調で、300文字以内で。`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 400,
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
