"use client";

import { useState } from "react";
import { Settings, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SettingsClientProps {
  settings: {
    notion_access_token?: string | null;
    notion_workspace_name?: string | null;
  } | null;
  userEmail: string;
}

export function SettingsClient({ settings, userEmail }: SettingsClientProps) {
  const [notionToken, setNotionToken] = useState(settings?.notion_access_token ?? "");
  const [notionWorkspace, setNotionWorkspace] = useState(settings?.notion_workspace_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notion_access_token: notionToken,
        notion_workspace_name: notionWorkspace,
      }),
    });

    if (response.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">設定</h1>
        <p className="text-stone-500 mt-1 text-sm">アカウントと連携の設定</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">アカウント</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium">
              {userEmail[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">{userEmail}</p>
              <p className="text-xs text-stone-400">Supabase Auth</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notion integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Notion連携</CardTitle>
              <CardDescription>
                習慣診断とウィークリーレビューでNotionデータを分析するために使用します
              </CardDescription>
            </div>
            {settings?.notion_access_token && (
              <Badge variant="essential">
                <Check className="w-3 h-3 mr-1" />
                接続済み
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600 leading-relaxed">
            <p className="font-medium text-stone-700 mb-2">
              Notion Integration Tokenの取得方法
            </p>
            <ol className="space-y-1.5 list-decimal list-inside text-stone-500">
              <li>
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-700 underline inline-flex items-center gap-0.5"
                >
                  notion.so/my-integrations
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                を開く
              </li>
              <li>「新しいインテグレーション」を作成</li>
              <li>「内部インテグレーション トークン」をコピー</li>
              <li>分析したいNotionデータベースをインテグレーションと共有</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Notion Integration Token
            </label>
            <Input
              type="password"
              placeholder="secret_xxxxxxxxxxxx"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              ワークスペース名（任意）
            </label>
            <Input
              placeholder="例：AI-Readyな自分づくり"
              value={notionWorkspace}
              onChange={(e) => setNotionWorkspace(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} loading={saving}>
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                保存しました
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                設定を保存する
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">essentia について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-stone-500">
          <p>
            グレッグ・マキューン著『エッセンシャル思考 最少の時間で成果を最大にする』に基づくパーソナルAIコーチ。
          </p>
          <p className="italic text-stone-400">
            「より少なく、しかしより良く」
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
