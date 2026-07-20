"use client";

import { useState } from "react";
import { Focus, Sparkles, Check, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIMessage } from "@/components/ui/ai-message";
import { DailyFocus, EssentialIntent } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HabitItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  done: boolean;
  log_id: string | null;
}

interface DailyFocusClientProps {
  todayFocus: DailyFocus | null;
  activeIntent: EssentialIntent | null;
  today: string;
  habits: HabitItem[];
}

function PermaScore({
  label, value, onChange,
}: { label: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs font-medium text-stone-600 mb-1.5">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "w-9 h-9 rounded-xl text-sm font-semibold transition-all",
              value === n
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyFocusClient({
  todayFocus: initialFocus,
  activeIntent,
  today,
  habits: initialHabits,
}: DailyFocusClientProps) {
  const [focus, setFocus] = useState(initialFocus);
  const [essential, setEssential] = useState("");
  const [reflection, setReflection] = useState(initialFocus?.reflection ?? "");
  const [permaPositive, setPermaPositive] = useState<number | null>(initialFocus?.perma_positive ?? null);
  const [permaMeaning, setPermaMeaning] = useState<number | null>(initialFocus?.perma_meaning ?? null);
  const [permaAchieve, setPermaAchieve] = useState<number | null>(initialFocus?.perma_achieve ?? null);
  const [habits, setHabits] = useState(initialHabits);
  const [aiSuggestion, setAiSuggestion] = useState(initialFocus?.ai_suggestion ?? "");
  const [aiSuggestionStreaming, setAiSuggestionStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [habitToggling, setHabitToggling] = useState<string | null>(null);

  const hour = new Date().getHours();
  const isEvening = hour >= 17;
  const doneHabits = habits.filter((h) => h.done).length;

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
      body: JSON.stringify({ date: today, essential_task: essential, ai_suggestion: aiSuggestion }),
    });
    if (response.ok) setFocus(await response.json());
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
    if (response.ok) setFocus(await response.json());
    setLoading(false);
  }

  async function handleSaveReflection() {
    if (!focus) return;
    setReflectionLoading(true);
    const response = await fetch(`/api/daily-focus/${focus.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reflection,
        perma_positive: permaPositive,
        perma_meaning: permaMeaning,
        perma_achieve: permaAchieve,
        habits_checked: true,
      }),
    });
    if (response.ok) setFocus(await response.json());
    setReflectionLoading(false);
  }

  async function handleHabitToggle(habit: HabitItem) {
    setHabitToggling(habit.id);
    const response = await fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habit.id, date: today, done: !habit.done, log_id: habit.log_id }),
    });
    if (response.ok) {
      const log = await response.json();
      setHabits((prev) => prev.map((h) => h.id === habit.id ? { ...h, done: log.done, log_id: log.id } : h));
    }
    setHabitToggling(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">デイリーフォーカス</h1>
        <p className="text-stone-500 mt-1 text-sm">{formatDate(today)} — 今日の本質を1つ決めましょう。</p>
      </div>

      {activeIntent && (
        <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
          <p className="text-xs text-stone-400 font-medium mb-1">あなたのインテント（第10章）</p>
          <p className="text-sm text-stone-700 font-medium">{activeIntent.title}</p>
        </div>
      )}

      {/* Focus set */}
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
                  <span className="text-sm font-medium">完了！素晴らしい。</span>
                </div>
              ) : (
                <Button className="mt-4 bg-white text-stone-900 hover:bg-stone-100" onClick={handleComplete} loading={loading}>
                  <Check className="w-4 h-4" />完了にする
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Evening reflection + habits */}
          {(isEvening || focus.completed) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">夜の振り返り</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Habit check */}
                {habits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-3">
                      今日の習慣チェック
                      <span className="text-stone-400 font-normal ml-2">
                        {doneHabits}/{habits.length} 完了
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {habits.map((habit) => (
                        <button
                          key={habit.id}
                          onClick={() => !habitToggling && handleHabitToggle(habit)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all",
                            habit.done
                              ? "bg-stone-900 border-stone-900 text-white"
                              : "bg-stone-50 border-stone-100 text-stone-700 hover:border-stone-200"
                          )}
                        >
                          <span>{habit.icon}</span>
                          <span className="font-medium truncate">{habit.name}</span>
                          {habit.done && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PERMA scores */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-stone-700">今日の状態（1〜5）</p>
                  <PermaScore label="😊 ポジティブ感情" value={permaPositive} onChange={setPermaPositive} />
                  <PermaScore label="✨ 意味・充実感（第19章）" value={permaMeaning} onChange={setPermaMeaning} />
                  <PermaScore label="🏆 達成感" value={permaAchieve} onChange={setPermaAchieve} />
                </div>

                {/* Free reflection */}
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-1.5">メモ（任意）</p>
                  <Textarea
                    placeholder="今日気づいたこと、明日に活かしたいこと..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveReflection} loading={reflectionLoading} className="w-full">
                  <Check className="w-4 h-4" />振り返りを保存
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Morning: set focus */
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Focus className="w-4 h-4 text-stone-600" />
                <CardTitle className="text-base">今日のエッセンシャルを決める</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">第19章：集中の問い</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  「今日最も重要なことは何ですか？」1つだけ。今日の終わりに「これだけできれば十分だった」と言えることを選んでください。
                </p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={handleGetSuggestion} loading={aiSuggestionStreaming}>
                  <Sparkles className="w-3.5 h-3.5" />AIに候補を提案してもらう
                </Button>
                {aiSuggestion && (
                  <AIMessage content={aiSuggestion} isStreaming={aiSuggestionStreaming} />
                )}
              </div>

              <Textarea
                placeholder="今日、最も重要なことは何ですか？"
                value={essential}
                onChange={(e) => setEssential(e.target.value)}
                rows={3}
              />

              <Button onClick={handleSetFocus} loading={loading} disabled={!essential} className="w-full">
                <Lock className="w-4 h-4" />今日のエッセンシャルを決定・ロック
              </Button>
              <p className="text-xs text-stone-400 text-center">一度設定するとロックされます</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
