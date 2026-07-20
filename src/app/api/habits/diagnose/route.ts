import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";
import { createNotionClient, listDatabases } from "@/lib/notion";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: settings } = await supabase
    .from("user_settings")
    .select("notion_access_token")
    .eq("user_id", user.id)
    .single();

  // Fetch active intent for context
  const { data: activeIntent } = await supabase
    .from("essential_intents")
    .select("title")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  let notionContext = "";

  if (settings?.notion_access_token) {
    try {
      const notion = createNotionClient(settings.notion_access_token);
      const databases = await listDatabases(notion);

      const habitKeywords = [
        "キックボクシング", "運動", "英語", "睡眠", "ストレッチ",
        "家事", "振り返り", "PERMA", "食事", "体重",
      ];

      const habitDbs = databases.filter(
        (db: { id: string; name: string; lastEdited: string } | null) =>
          db && habitKeywords.some((kw) => db.name.includes(kw))
      );

      if (habitDbs.length > 0) {
        notionContext = `\n■ Notionデータベース（実データ）：\n`;
        for (const db of habitDbs.slice(0, 8)) {
          if (!db) continue;
          const daysSince = Math.floor(
            (Date.now() - new Date(db.lastEdited).getTime()) / (1000 * 60 * 60 * 24)
          );
          const status =
            daysSince <= 3
              ? "🟢 継続中"
              : daysSince <= 14
              ? "🟡 最近更新"
              : "🔴 途絶えている";
          notionContext += `- ${db.name}：${status}（最終更新 ${daysSince}日前）\n`;
        }
      }
    } catch {
      notionContext = "\n（Notion APIエラー：サンプルデータで代替）";
    }
  }

  const sampleData = `
■ サンプルデータ（Notion未連携のデモ）：
- キックボクシング記録DB：🔴 途絶えている（最終更新 45日前）
- 英語学習DB：🔴 途絶えている（最終更新 62日前）
- 1日振り返りDB（PERMA）：🟢 継続中（意味スコアはほぼ「普通」）
- 睡眠記録DB：🟢 継続中（2日前）
- 運動記録DB：🔴 途絶えている（最終更新 45日前）
- 食事記録DB：🟡 最近更新（10日前）`;

  const contextToUse = notionContext || sampleData;

  const prompt = `以下のユーザーのNotionデータを分析し、エッセンシャルな習慣を特定してください。

━━━ ユーザーのコンテキスト ━━━
現在のインテント（第10章）：「${activeIntent?.title || "未設定"}」

${contextToUse}

━━━ 分析の観点（エッセンシャル思考） ━━━
・第8章（睡眠）：睡眠の質・量は最優先で守るべき習慣
・第18章（習慣）：意識のエネルギーを使わずに重要な行動を自動化できているか
・第17章（前進）：途絶えた習慣は「やめるべき」ではなく「再開する最小ステップ」を考える
・第12章（キャンセル）：「記録が途絶えた = 本質的でなくなった」とは限らない。サンクコストバイアスを排除して評価する

重要：「途絶えているから捨てる」ではなく、インテントとPERMAスコアとの相関で判断してください。

━━━ 返答形式 ━━━
以下のJSON形式で返してください（JSONのみ）：
{
  "essential_habits": [
    {
      "name": "習慣名",
      "reason": "なぜ本質的か。第○章の観点から（60文字以内）",
      "notion_db": "対応するNotionDB名またはnull",
      "is_active": true（継続中）またはfalse（途絶えている）
    }
  ],
  "summary": "全体サマリー（インテントとの整合性・パターン分析を含めて250文字以内）",
  "warning": "3週以上途絶えている本質的な習慣への警告メッセージ（なければnull）"
}

守るべき習慣を3つ選んでください。優先順は：インテントとの直結度 > PERMA意味スコアとの相関 > 継続しやすさ`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 900,
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
