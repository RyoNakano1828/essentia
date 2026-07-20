"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, Shield, Focus, ArrowRight, ChevronRight, Flame, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EssentialIntent, DailyFocus } from "@/types";
import { formatDate } from "@/lib/utils";

interface HabitSummary {
  id: string;
  name: string;
  icon: string;
  streak: number;
  done_today: boolean;
}

interface CommitmentSummary {
  id: string;
  title: string;
  requester: string | null;
  score: number | null;
  status: string;
}

interface WeeklySummaryData {
  week_start: string;
  week_end: string;
  focus_completion_rate: number;
  completed_days: number;
  total_days: number;
  top_habits: { name: string; icon: string; done_days: number }[];
  avg_meaning: number | null;
  ai_summary: string;
}

interface DashboardClientProps {
  activeIntent: EssentialIntent | null;
  todayFocus: DailyFocus | null;
  pendingCommitments: CommitmentSummary[];
  habits: HabitSummary[];
  today: string;
}

export function DashboardClient({
  activeIntent,
  todayFocus,
  pendingCommitments,
  habits,
  today,
}: DashboardClientProps) {
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "おはようございます" : hour < 18 ? "こんにちは" : "こんばんは";
  const isEvening = hour >= 17;

  const doneToday = habits.filter((h) => h.done_today).length;
  const habitRate = habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0;
  const topStreak = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0);

  async function loadWeeklySummary() {
    setSummaryLoading(true);
    const res = await fetch("/api/weekly-summary");
    if (res.ok) setWeeklySummary(await res.json());
    setSummaryLoading(false);
  }

  // Auto-load summary in the evening
  useEffect(() => {
    if (isEvening) loadWeeklySummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{greeting} 👋</h1>
        <p className="text-stone-500 mt-1 text-sm">{formatDate(today)}</p>
      </div>

      {/* Today's focus banner */}
      <div className="bg-stone-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Focus className="w-4 h-4 text-stone-400" />
          <span className="text-stone-400 text-xs font-medium uppercase tracking-wide">
            今日のエッセンシャル（第19章）
          </span>
        </div>
        {todayFocus ? (
          <>
            <p className="text-xl font-semibold">{todayFocus.essential_task}</p>
            {todayFocus.completed && (
              <p className="text-emerald-400 text-sm font-medium mt-2">✓ 完了</p>
            )}
          </>
        ) : (
          <>
            <p className="text-stone-400 text-sm">今日の本質がまだ設定されていません</p>
            <Link
              href="/daily-focus"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              今日の本質を決める <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>

      {/* Habit snapshot */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">今日の習慣</CardTitle>
              <Link href="/habits" className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5">
                すべて <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#e7e5e4" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="22" fill="none"
                    stroke={habitRate === 100 ? "#10b981" : "#1c1917"}
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 * (1 - habitRate / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-stone-900">{habitRate}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900">
                  {doneToday} / {habits.length} 完了
                </p>
                {topStreak > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-stone-500">最大 {topStreak} 日連続</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    h.done_today
                      ? "bg-stone-900 text-white"
                      : "bg-stone-50 text-stone-500"
                  }`}
                >
                  <span>{h.icon}</span>
                  <span className="truncate">{h.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intent */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-stone-500" />
              <CardTitle className="text-base">エッセンシャル・インテント</CardTitle>
            </div>
            <Link href="/intent" className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5">
              詳細 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeIntent ? (
            <div>
              <p className="font-semibold text-stone-900">{activeIntent.title}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="essential">
                  {activeIntent.period_type === "quarterly" ? "四半期" : "年間"}
                </Badge>
                <span className="text-xs text-stone-400">{formatDate(activeIntent.end_date)} まで</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-stone-500 mb-2">最重要目標がまだ設定されていません</p>
              <Link href="/intent" className="text-sm font-medium text-stone-900 hover:underline inline-flex items-center gap-1">
                インテントを設定する <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending commitments */}
      {pendingCommitments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-500" />
                <CardTitle className="text-base">評価待ちの依頼</CardTitle>
              </div>
              <Link href="/commitments" className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5">
                すべて <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingCommitments.map((c) => (
                <Link
                  key={c.id}
                  href={`/commitments`}
                  className="flex items-center justify-between py-2 hover:opacity-70 transition-opacity"
                >
                  <p className="text-sm text-stone-700 truncate">{c.title}</p>
                  {c.score !== null && (
                    <Badge variant={c.score >= 90 ? "essential" : c.score >= 50 ? "warning" : "danger"} className="ml-2 flex-shrink-0">
                      {c.score}点
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly auto-summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-stone-500" />
              <CardTitle className="text-base">今週のサマリー</CardTitle>
            </div>
            {!weeklySummary && (
              <button
                onClick={loadWeeklySummary}
                disabled={summaryLoading}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                {summaryLoading ? "生成中..." : "生成する"}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {weeklySummary ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-900">{weeklySummary.focus_completion_rate}%</p>
                  <p className="text-xs text-stone-400">フォーカス達成率</p>
                </div>
                {weeklySummary.avg_meaning !== null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-stone-900">{weeklySummary.avg_meaning}</p>
                    <p className="text-xs text-stone-400">平均充実感</p>
                  </div>
                )}
                {weeklySummary.top_habits.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {weeklySummary.top_habits.map((h) => (
                      <span key={h.name} className="text-xs bg-stone-50 rounded-lg px-2 py-1">
                        {h.icon} {h.done_days}日
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-700 leading-relaxed">
                {weeklySummary.ai_summary}
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-400 text-center py-4">
              {summaryLoading ? "AIが今週のデータを分析中..." : "「生成する」で今週の振り返りをAIが自動作成します"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
