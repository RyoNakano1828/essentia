import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChatCompletion, SYSTEM_PROMPT } from "@/lib/openai";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, requester, deadline, description, activeIntent } = await request.json();

  // Fetch essential habits for context
  const { data: essentialHabits } = await supabase
    .from("habits")
    .select("name")
    .eq("user_id", user.id)
    .eq("is_essential", true);

  const prompt = `以下の依頼を「90点ルール」で評価してください。

依頼内容：「${title}」
依頼者：${requester || "不明"}
期日：${deadline || "未設定"}
詳細：${description || "なし"}

${activeIntent ? `現在のインテント：「${activeIntent.title}」` : ""}
${essentialHabits?.length ? `守るべき本質的な習慣：${essentialHabits.map((h: { name: string }) => h.name).join("、")}` : ""}

以下のJSON形式で返してください（JSONのみ、説明不要）：
{
  "score": 0-100の整数,
  "reasoning": "評価の理由（インテントや本質的な習慣への影響も含めて、200文字以内）",
  "decline_gentle": "やんわりとした断り文句（100文字以内）",
  "decline_clear": "明確な断り文句（100文字以内）",
  "decline_final": "最終手段の断り文句（100文字以内）"
}

90点未満の場合のみ断り文句が必要です。90点以上の場合は空文字でOK。`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 600,
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
