import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { title, description, periodType } = await request.json();

  const prompt = `ユーザーが以下のエッセンシャル・インテント（最重要目標）を設定しようとしています：

インテント：「${title}」
期間：${periodType === "quarterly" ? "四半期" : "年間"}
理由：${description || "（未記入）"}

このインテントについて、以下の観点からフィードバックをください：
1. 具体性：「勇気が出るほど具体的」かどうか
2. 本質性：本当にこれが最重要かどうかを問い返す
3. 測定可能性：達成したかどうかわかるか
4. 改善提案：より良い表現があれば1つだけ提案

温かみのある口調で、200文字以内で簡潔に。`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 300,
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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
