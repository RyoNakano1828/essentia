"use client";

import { useState } from "react";
import { CalendarDays, Sparkles, Settings, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIMessage } from "@/components/ui/ai-message";
import { Habit } from "@/types";

interface HabitsClientProps {
  habits: Habit[];
  hasNotionToken: boolean;
  notionWorkspace: string | null;
}

interface DiagnosisResult {
  essential_habits: {
    name: string;
    reason: string;
    notion_db: string | null;
    is_active: boolean;
  }[];
  summary: string;
  warning: string | null;
}

export function HabitsClient({
  habits: initialHabits,
  hasNotionToken,
  notionWorkspace,
}: HabitsClientProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleDiagnose() {
    setDiagnosing(true);
    setResult(null);

    const response = await fetch("/api/habits/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      setResult(data);
    }
    setDiagnosing(false);
  }

  async function handleSaveResults() {
    if (!result) return;
    setSaving(true);

    const response = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits: result.essential_habits }),
    });

    if (response.ok) {
      const data = await response.json();
      setHabits(data);
      setResult(null);
    }
    setSaving(false);
  }

  const essentialHabits = habits.filter((h) => h.is_essential);
  const otherHabits = habits.filter((h) => !h.is_essential);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">習慣エッセンシャル診断</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Notionデータを分析し、本当に守るべき習慣をAIが特定します。
        </p>
      </div>

      {/* Notion connection status */}
      <Card className={hasNotionToken ? "border-emerald-200 bg-emerald-50" : ""}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasNotionToken ? "bg-emerald-100" : "bg-stone-100"
                }`}
              >
                <span className="text-base">N</span>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">
                  Notion連携
                </p>
                <p className="text-xs text-stone-500">
                  {hasNotionToken
                    ? `接続済み${notionWorkspace ? ` — ${notionWorkspace}` : ""}`
                    : "未接続"}
                </p>
              </div>
            </div>
            {hasNotionToken ? (
              <Badge variant="essential">
                <Check className="w-3 h-3 mr-1" />
                接続済み
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/settings"}>
                <Settings className="w-3.5 h-3.5" />
                設定する
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnose button */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">習慣エッセンシャル診断を実行</CardTitle>
          <CardDescription>
            {hasNotionToken
              ? "NotionのPERMAスコアと各習慣DBをAIがクロス分析します"
              : "Notionと連携することで、あなたの実際のデータに基づいた診断が可能になります"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-stone-700">分析内容</p>
            <ul className="text-sm text-stone-500 space-y-1.5">
              {[
                "PERMAスコア × 各習慣記録のクロス分析",
                "「この習慣をしている週は充実感が高い」を自動検出",
                "記録が途絶えている習慣への問いかけ",
                "守るべき習慣トップ3の提示",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleDiagnose}
            loading={diagnosing}
            className="w-full"
          >
            <Sparkles className="w-4 h-4" />
            {hasNotionToken ? "Notionデータで診断する" : "サンプルデータで診断する"}
          </Button>
        </CardContent>
      </Card>

      {/* Diagnosis result */}
      {result && (
        <Card className="border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base text-emerald-800">
                診断結果
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIMessage content={result.summary} />

            {result.warning && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-sm text-amber-800">
                  ⚠️ {result.warning}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-700">
                守るべき習慣トップ{result.essential_habits.length}
              </p>
              {result.essential_habits.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    h.is_active
                      ? "bg-emerald-50 border border-emerald-100"
                      : "bg-stone-50 border border-stone-100"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      h.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-stone-300 text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-stone-900">
                        {h.name}
                      </p>
                      {h.notion_db && (
                        <Badge variant="muted" className="text-xs">
                          {h.notion_db}
                        </Badge>
                      )}
                      {!h.is_active && (
                        <Badge variant="warning" className="text-xs">
                          途絶えている
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {h.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSaveResults} loading={saving} className="w-full">
              <Check className="w-4 h-4" />
              この診断結果を保存する
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Existing essential habits */}
      {essentialHabits.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-700 mb-3">
            本質的な習慣
          </h2>
          <div className="space-y-2">
            {essentialHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">
                    {habit.name}
                  </p>
                  {habit.notion_db_name && (
                    <p className="text-xs text-stone-400">{habit.notion_db_name}</p>
                  )}
                </div>
                <Badge variant="essential">本質的</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherHabits.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-500 mb-3">
            その他の習慣
          </h2>
          <div className="space-y-2">
            {otherHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 opacity-60"
              >
                <div className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0" />
                <p className="text-sm text-stone-600">{habit.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && !result && (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-sm text-stone-500">
            まだ診断結果がありません。上のボタンから診断を実行してください。
          </p>
        </div>
      )}
    </div>
  );
}
