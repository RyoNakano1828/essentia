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

  // Fetch yesterday's reflection for context
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { data: lastFocus } = await supabase
    .from("daily_focus")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", yesterday.toISOString().split("T")[0])
    .single();

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("ja-JP", { weekday: "long" });

  const prompt = `今日（${dayOfWeek}）の「今日のエッセンシャル」を決めるお手伝いをします。

${activeIntent ? `現在のインテント：「${activeIntent.title}」` : ""}
${lastFocus ? `昨日のエッセンシャル：「${lastFocus.essential_task}」（${lastFocus.completed ? "完了" : "未完了"}）` : ""}
${lastFocus?.reflection ? `昨日の振り返り：「${lastFocus.reflection}」` : ""}

今日インテントに最も近づくために、最も本質的なアクションを1つ提案してください。
また「今日、最も重要なことは何ですか？」という問いかけも添えてください。
150文字以内で。`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.8,
    max_tokens: 200,
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
