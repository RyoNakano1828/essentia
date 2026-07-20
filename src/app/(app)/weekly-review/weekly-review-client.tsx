"use client";

import { useState } from "react";
import { CalendarDays, Sparkles, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AIMessage } from "@/components/ui/ai-message";
import { WeeklyReview, EssentialIntent } from "@/types";
import { formatDate } from "@/lib/utils";

interface WeeklyReviewClientProps {
  currentReview: WeeklyReview | null;
  activeIntent: EssentialIntent | null;
  recentReviews: WeeklyReview[];
  weekStart: string;
  weekEnd: string;
}

export function WeeklyReviewClient({
  currentReview: initialReview,
  activeIntent,
  recentReviews,
  weekStart,
  weekEnd,
}: WeeklyReviewClientProps) {
  const [review, setReview] = useState(initialReview);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState({
    key_achievement: review?.key_achievement ?? "",
    time_thief: review?.time_thief ?? "",
    commitments_to_drop: review?.commitments_to_drop ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState(review?.ai_summary ?? "");
  const [aiStreaming, setAiStreaming] = useState(false);

  async function handleGenerateSummary() {
    setGenerating(true);
    setAiStreaming(true);
    setAiSummary("");

    const response = await fetch("/api/weekly-review/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, weekEnd, activeIntent }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAiSummary((prev) => prev + decoder.decode(value));
      }
    }

    setAiStreaming(false);
    setGenerating(false);
  }

  async function handleSave() {
    setSaving(true);

    const response = await fetch("/api/weekly-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        week_start: weekStart,
        week_end: weekEnd,
        ai_summary: aiSummary,
        ...answers,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setReview(data);
    }
    setSaving(false);
  }

  const hasPattern =
    recentReviews.filter((r) => r.time_thief === answers.time_thief && answers.time_thief).length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">ウィークリーレビュー</h1>
        <p className="text-stone-500 mt-1 text-sm">
          {formatDate(weekStart)} 〜 {formatDate(weekEnd)} の振り返り
        </p>
      </div>

      {activeIntent && (
        <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
          <p className="text-xs text-stone-400 font-medium mb-1">今期のインテント</p>
          <p className="text-sm text-stone-700 font-medium">{activeIntent.title}</p>
        </div>
      )}

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">AIによる週サマリー</CardTitle>
              <CardDescription>
                Notionデータを読み込み、今週のパターンを分析します
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              loading={generating}
            >
              <Sparkles className="w-3.5 h-3.5" />
              生成する
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiSummary ? (
            <AIMessage content={aiSummary} isStreaming={aiStreaming} />
          ) : (
            <p className="text-sm text-stone-400 text-center py-4">
              「生成する」ボタンでAIがNotionデータを分析します
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pattern warning */}
      {hasPattern && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              3週連続で同じパターンが続いています
            </p>
            <p className="text-sm text-amber-700 mt-1">
              「{answers.time_thief}」が繰り返し時間を奪っています。根本的な対処が必要かもしれません。
            </p>
          </div>
        </div>
      )}

      {/* Review questions */}
      <div className="space-y-4">
        {[
          {
            key: "key_achievement" as const,
            question: "今週最も重要な成果は何でしたか？",
            placeholder: "インテントに近づいた出来事、達成したこと...",
            icon: "🏆",
          },
          {
            key: "time_thief" as const,
            question: "何があなたの時間を一番奪いましたか？",
            placeholder: "会議、SNS、頼まれ仕事、予期せぬ作業...",
            icon: "⏰",
          },
          {
            key: "commitments_to_drop" as const,
            question: "来週、捨てられるコミットメントはありますか？",
            placeholder: "本質的でなくなったタスク、習慣、約束...",
            icon: "🗑️",
          },
        ].map((q) => (
          <Card key={q.key}>
            <CardContent className="pt-4">
              <label className="block text-sm font-medium text-stone-900 mb-2">
                <span className="mr-1.5">{q.icon}</span>
                {q.question}
              </label>
              <Textarea
                placeholder={q.placeholder}
                value={answers[q.key]}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
                }
                rows={3}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Essential action for next week */}
      {review?.essential_action_next_week && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">
                来週のエッセンシャルアクション
              </p>
            </div>
            <p className="text-sm text-emerald-700">
              {review.essential_action_next_week}
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSave}
        loading={saving}
        className="w-full"
        disabled={!answers.key_achievement}
      >
        <Check className="w-4 h-4" />
        レビューを保存する
      </Button>

      {/* Recent reviews */}
      {recentReviews.filter((r) => r.week_start !== weekStart).length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-500 mb-3">過去のレビュー</h2>
          <div className="space-y-2">
            {recentReviews
              .filter((r) => r.week_start !== weekStart)
              .map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white rounded-xl border border-stone-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-stone-400">
                      {formatDate(r.week_start)} 〜 {formatDate(r.week_end)}
                    </p>
                    {r.pattern_warning && (
                      <Badge variant="warning">パターン警告</Badge>
                    )}
                  </div>
                  {r.key_achievement && (
                    <p className="text-sm text-stone-700">
                      🏆 {r.key_achievement}
                    </p>
                  )}
                  {r.essential_action_next_week && (
                    <p className="text-xs text-stone-400 mt-1">
                      → {r.essential_action_next_week}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
