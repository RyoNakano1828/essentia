"use client";

import { useState } from "react";
import { Focus, Sparkles, Check, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIMessage } from "@/components/ui/ai-message";
import { EssentialIntent, DailyFocus } from "@/types";
import { formatDate } from "@/lib/utils";

interface DailyFocusClientProps {
  todayFocus: DailyFocus | null;
  activeIntent: EssentialIntent | null;
  today: string;
}

export function DailyFocusClient({
  todayFocus: initialFocus,
  activeIntent,
  today,
}: DailyFocusClientProps) {
  const [focus, setFocus] = useState(initialFocus);
  const [essential, setEssential] = useState("");
  const [reflection, setReflection] = useState(initialFocus?.reflection ?? "");
  const [aiSuggestion, setAiSuggestion] = useState(initialFocus?.ai_suggestion ?? "");
  const [aiSuggestionStreaming, setAiSuggestionStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  const hour = new Date().getHours();
  const isEvening = hour >= 17;

  async function handleGetSuggestion() {
    setAiSuggestionStreaming(true);
    setAiSuggestion("");

    const response = await fetch("/api/daily-focus/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeIntent }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAiSuggestion((prev) => prev + decoder.decode(value));
      }
    }
    setAiSuggestionStreaming(false);
  }

  async function handleSetFocus() {
    if (!essential) return;
    setLoading(true);

    const response = await fetch("/api/daily-focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        essential_task: essential,
        ai_suggestion: aiSuggestion,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setFocus(data);
    }
    setLoading(false);
  }

  async function handleComplete() {
    if (!focus) return;
    setLoading(true);

    const response = await fetch(`/api/daily-focus/${focus.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });

    if (response.ok) {
      const data = await response.json();
      setFocus(data);
    }
    setLoading(false);
  }

  async function handleSaveReflection() {
    if (!focus) return;
    setReflectionLoading(true);

    const response = await fetch(`/api/daily-focus/${focus.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection }),
    });

    if (response.ok) {
      const data = await response.json();
      setFocus(data);
    }
    setReflectionLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">デイリーフォーカス</h1>
        <p className="text-stone-500 mt-1 text-sm">
          {formatDate(today)} — 今日の本質を1つ決めましょう。
        </p>
      </div>

      {/* Active Intent context */}
      {activeIntent && (
        <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
          <p className="text-xs text-stone-400 font-medium mb-1">
            あなたのインテント
          </p>
          <p className="text-sm text-stone-700 font-medium">
            {activeIntent.title}
          </p>
        </div>
      )}

      {/* Today's focus — already set */}
      {focus ? (
        <div className="space-y-4">
          <Card className="border-stone-900 bg-stone-900 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-stone-400" />
                <span className="text-stone-400 text-xs font-medium uppercase tracking-wide">
                  今日のエッセンシャル（ロック済み）
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{focus.essential_task}</p>
              {focus.completed ? (
                <div className="flex items-center gap-2 mt-4 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">完了しました！素晴らしい。</span>
                </div>
              ) : (
                <Button
                  className="mt-4 bg-white text-stone-900 hover:bg-stone-100"
                  onClick={handleComplete}
                  loading={loading}
                >
                  <Check className="w-4 h-4" />
                  完了にする
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Evening reflection */}
          {(isEvening || focus.completed) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">夜の振り返り</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-stone-500">
                  今日のエッセンシャルを振り返って、明日のコーチングに活かします。
                </p>
                <Textarea
                  placeholder="今日学んだことや気づきを自由に..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleSaveReflection}
                  loading={reflectionLoading}
                  variant="outline"
                  disabled={!reflection}
                >
                  振り返りを保存
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Set today's focus */
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Focus className="w-4 h-4 text-stone-600" />
                <CardTitle className="text-base">
                  今日のエッセンシャルを決める
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">
                  💡 エッセンシャルとは？
                </p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  今日の終わりに「これだけできれば十分だった」と言えること。
                  1つだけ選ぶ。それがエッセンシャルです。
                </p>
              </div>

              {/* AI Suggestion */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetSuggestion}
                  loading={aiSuggestionStreaming}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AIに候補を提案してもらう
                </Button>
                {aiSuggestion && (
                  <AIMessage
                    content={aiSuggestion}
                    isStreaming={aiSuggestionStreaming}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  今日のエッセンシャル
                </label>
                <Textarea
                  placeholder="今日、最も重要なことは何ですか？"
                  value={essential}
                  onChange={(e) => setEssential(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSetFocus}
                loading={loading}
                disabled={!essential}
                className="w-full"
              >
                <Lock className="w-4 h-4" />
                今日のエッセンシャルを決定・ロック
              </Button>

              <p className="text-xs text-stone-400 text-center">
                一度設定すると、今日のエッセンシャルはロックされます
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
