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

  let notionContext = "";

  if (settings?.notion_access_token) {
    try {
      const notion = createNotionClient(settings.notion_access_token);
      const databases = await listDatabases(notion);

      const habitDbs = databases.filter((db: { id: string; name: string; lastEdited: string } | null) =>
        db &&
        [
          "キックボクシング",
          "運動",
          "英語",
          "睡眠",
          "ストレッチ",
          "家事",
          "1日振り返り",
          "PERMA",
        ].some((keyword) => db.name.includes(keyword))
      );

      if (habitDbs.length > 0) {
        notionContext = `\nNotionデータベース情報：\n`;
        for (const db of habitDbs.slice(0, 5)) {
          if (!db) continue;
          const daysSince = Math.floor(
            (Date.now() - new Date(db.lastEdited).getTime()) / (1000 * 60 * 60 * 24)
          );
          notionContext += `- ${db.name}：最終更新 ${daysSince}日前\n`;
        }
      }
    } catch {
      // Notion API error — continue without data
    }
  }

  // Sample data for demo / fallback
  const sampleData = `
サンプルデータ（Notion未連携の場合のデモ）：
- キックボクシング記録DB：最終更新 45日前（仕事の増加で中断）
- 英語学習DB：最終更新 62日前
- 1日振り返りDB（PERMA）：意味スコアがほぼ「普通」
- 睡眠記録DB：最終更新 2日前（継続中）
- 運動記録DB：最終更新 45日前`;

  const contextToUse = notionContext || sampleData;

  const prompt = `以下のユーザーのNotionデータを分析し、エッセンシャルな習慣を特定してください。

${contextToUse}

エッセンシャル思考の観点から、以下のJSON形式で回答してください：
{
  "essential_habits": [
    {
      "name": "習慣名",
      "reason": "なぜこれが本質的か（50文字以内）",
      "notion_db": "対応するNotionDB名またはnull",
      "is_active": true/false（現在継続中かどうか）
    }
  ],
  "summary": "全体サマリー（200文字以内）",
  "warning": "警告メッセージまたはnull"
}

守るべき習慣トップ3を選んでください。
「記録が途絶えている = 本質的でない」とは限りません。
PERMAスコアや充実感との相関で判断してください。`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 800,
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
