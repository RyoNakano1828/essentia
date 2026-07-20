"use client";

import { useState } from "react";
import { Plus, Settings, Check, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HabitWithStreak } from "@/types";
import { formatDate } from "@/lib/utils";

interface HabitsClientProps {
  habits: HabitWithStreak[];
  today: string;
}

const CATEGORIES = ["運動", "学習", "健康", "食事", "生活", "その他"];
const ICONS = ["🥊", "🧘", "📚", "😴", "🍽️", "⚖️", "🏠", "💰", "🏃", "💪", "🎯", "✍️", "🎵", "🧹", "💊"];

export function HabitsClient({ habits: initialHabits, today }: HabitsClientProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("その他");
  const [newIcon, setNewIcon] = useState("✅");
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const doneCount = habits.filter((h) => h.done_today).length;
  const completionRate = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

  async function handleToggle(habit: HabitWithStreak) {
    setToggling(habit.id);
    const response = await fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habit_id: habit.id,
        date: today,
        done: !habit.done_today,
        log_id: habit.log_id,
      }),
    });
    if (response.ok) {
      const log = await response.json();
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id
            ? {
                ...h,
                done_today: log.done,
                log_id: log.id,
                streak: log.done ? h.streak + (h.done_today ? 0 : 1) : Math.max(0, h.streak - 1),
              }
            : h
        )
      );
    }
    setToggling(null);
  }

  async function handleAdd() {
    if (!newName) return;
    setAdding(true);
    const response = await fetch("/api/habits/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, category: newCategory, icon: newIcon }),
    });
    if (response.ok) {
      const habit = await response.json();
      setHabits((prev) => [...prev, { ...habit, streak: 0, done_today: false, log_id: null }]);
      setNewName("");
      setShowAdd(false);
    }
    setAdding(false);
  }

  async function handleDeactivate(id: string) {
    await fetch(`/api/habits/templates/${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  const byCategory = CATEGORIES.reduce<Record<string, HabitWithStreak[]>>((acc, cat) => {
    const items = habits.filter((h) => h.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">習慣トラッカー</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {formatDate(today)} — 今日の習慣をチェックしましょう
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4" />
            追加
          </Button>
        </div>
      </div>

      {/* Progress ring */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 flex items-center gap-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={completionRate === 100 ? "#10b981" : "white"}
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * (1 - completionRate / 100)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{completionRate}%</span>
          </div>
        </div>
        <div>
          <p className="text-stone-300 text-xs font-medium mb-1">今日の達成率</p>
          <p className="text-2xl font-bold">
            {doneCount} / {habits.length}
          </p>
          <p className="text-stone-400 text-xs mt-1">習慣完了</p>
          {completionRate === 100 && (
            <p className="text-emerald-400 text-sm font-medium mt-2">🎉 全習慣コンプリート！</p>
          )}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">新しい習慣を追加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="flex gap-1 flex-wrap">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                      newIcon === icon ? "bg-stone-900 text-white" : "bg-stone-100 hover:bg-stone-200"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <Input
              placeholder="習慣名（例：読書、ランニング）"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    newCategory === cat
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} loading={adding} disabled={!newName} className="flex-1">
                <Plus className="w-4 h-4" />
                追加する
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>キャンセル</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits by category */}
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            {category}
          </p>
          <div className="space-y-2">
            {items.map((habit) => (
              <button
                key={habit.id}
                onClick={() => !toggling && handleToggle(habit)}
                disabled={!!toggling}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  habit.done_today
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "bg-white border-stone-100 hover:border-stone-200 hover:shadow-sm"
                }`}
              >
                <span className="text-2xl flex-shrink-0">{habit.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${habit.done_today ? "text-white" : "text-stone-900"}`}>
                    {habit.name}
                  </p>
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Flame className={`w-3 h-3 ${habit.done_today ? "text-orange-300" : "text-orange-400"}`} />
                      <span className={`text-xs font-medium ${habit.done_today ? "text-stone-300" : "text-stone-500"}`}>
                        {habit.streak}日連続
                      </span>
                    </div>
                  )}
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  habit.done_today
                    ? "bg-white border-white"
                    : "border-stone-200"
                }`}>
                  {habit.done_today && <Check className="w-4 h-4 text-stone-900" />}
                </div>

                {/* Settings mode: delete button */}
                {showSettings && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeactivate(habit.id); }}
                    className="ml-2 text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    削除
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {habits.length === 0 && !showAdd && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🎯</p>
          <h3 className="font-semibold text-stone-900 mb-2">習慣をまだ設定していません</h3>
          <p className="text-sm text-stone-500 mb-6 max-w-xs mx-auto">
            エッセンシャルな習慣を追加しましょう。「守るべき本質的なもの」だけを選んでください。
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" />
            最初の習慣を追加する
          </Button>
        </div>
      )}
    </div>
  );
}
