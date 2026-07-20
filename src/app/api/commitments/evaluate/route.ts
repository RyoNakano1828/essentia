import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai, SYSTEM_PROMPT, BOOK_KNOWLEDGE } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, requester, deadline, description, activeIntent } = await request.json();

  // Fetch essential habits for tradeoff analysis
  const { data: essentialHabits } = await supabase
    .from("habits")
    .select("name")
    .eq("user_id", user.id)
    .eq("is_essential", true);

  // Fetch recent daily focus to understand current priorities
  const { data: recentFocus } = await supabase
    .from("daily_focus")
    .select("essential_task, completed")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  const habitsText = essentialHabits?.length
    ? essentialHabits.map((h: { name: string }) => h.name).join("、")
    : "なし（習慣診断未実施）";

  const recentFocusText = recentFocus?.length
    ? recentFocus
        .map((f: { essential_task: string; completed: boolean }) =>
          `「${f.essential_task}」（${f.completed ? "完了" : "未完了"}）`
        )
        .join(", ")
    : "なし";

  const prompt = `以下の依頼を「エッセンシャル思考の90点ルール（第9章：選抜）」で評価してください。

━━━ 評価対象 ━━━
依頼内容：「${title}」
依頼者：${requester || "不明"}
期日：${deadline || "未設定"}
詳細：${description || "なし"}

━━━ ユーザーのコンテキスト ━━━
現在のインテント（第10章）：「${activeIntent?.title || "未設定"}」
守るべき本質的な習慣（第18章）：${habitsText}
最近のデイリーフォーカス（第19章）：${recentFocusText}

━━━ 評価指針（書籍より） ━━━
${BOOK_KNOWLEDGE}

━━━ 返答形式 ━━━
以下のJSON形式で返してください（JSONのみ、説明不要）：
{
  "score": 0から100の整数,
  "reasoning": "評価の理由。インテントとの整合性・トレードオフ（第4章）・サンクコスト（第12章）の観点を含めて250文字以内",
  "tradeoff": "これを引き受けると失われるもの（第4章：トレードオフ）。具体的に何が犠牲になるかを80文字以内で",
  "decline_gentle": "やんわりとした断り文句（第11章：拒否）。80文字以内",
  "decline_clear": "明確な断り文句（第11章：拒否）。80文字以内",
  "decline_final": "最終手段の断り文句（第14章：線引き）。80文字以内"
}

スコアの目安：
- 90〜100点：インテントに直結し、絶対にYESと言える
- 70〜89点：要検討。何かを手放す覚悟があれば引き受けてもよい
- 50〜69点：非本質的。インテントから遠ざかる可能性が高い
- 0〜49点：断るべき。相手には誠実に、自分のインテントを守るために

90点以上の場合、decline系は空文字でOK。`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 700,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";

  try {
    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI response parsing failed" }, { status: 500 });
  }
}
