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

  const prompt = `ユーザーが以下のエッセンシャル・インテント（第10章：目標）を設定しようとしています：

インテント：「${title}」
期間：${periodType === "quarterly" ? "四半期" : "年間"}
理由：${description || "（未記入）"}

以下のエッセンシャル思考の観点でフィードバックをください：

1. **孤独（第5章）**：本当に自分が主体的に選んだ目標ですか？誰かへの義務感や外的プレッシャーから来ていませんか？
2. **選抜（第9章・90点ルール）**：「絶対にYESと言い切れますか？」90点未満なら再考の余地があります。
3. **目標（第10章）**：「感動的なほど具体的で、意味深い」インテントになっていますか？「○○を向上させる」ではなく「○ヶ月で○○を達成する」のように。
4. **改善提案**：より本質的で具体的な表現があれば1つだけ提案する。

温かみのある口調で、250文字以内で簡潔に。`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 350,
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
