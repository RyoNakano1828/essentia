"use client";

import { useState } from "react";
import { Target, Plus, Sparkles, ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AIMessage } from "@/components/ui/ai-message";
import { EssentialIntent } from "@/types";
import { formatDate } from "@/lib/utils";

interface IntentClientProps {
  intents: EssentialIntent[];
}

export function IntentClient({ intents: initialIntents }: IntentClientProps) {
  const [intents, setIntents] = useState(initialIntents);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [periodType, setPeriodType] = useState<"quarterly" | "yearly">("quarterly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiFeedbackStreaming, setAiFeedbackStreaming] = useState(false);
  const [step, setStep] = useState<"form" | "feedback" | "done">("form");

  async function handleGetAIFeedback() {
    if (!title) return;
    setAiFeedbackStreaming(true);
    setAiFeedback("");
    setStep("feedback");

    const response = await fetch("/api/intent/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, periodType }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setAiFeedback((prev) => prev + chunk);
      }
    }
    setAiFeedbackStreaming(false);
  }

  async function handleSubmit() {
    setLoading(true);
    const response = await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        period_type: periodType,
        start_date: startDate,
        end_date: endDate,
        ai_feedback: aiFeedback,
      }),
    });

    if (response.ok) {
      const newIntent = await response.json();
      setIntents([newIntent, ...intents.map((i) => ({ ...i, is_active: false }))]);
      setShowForm(false);
      setTitle("");
      setDescription("");
      setAiFeedback("");
      setStep("form");
    }
    setLoading(false);
  }

  const activeIntent = intents.find((i) => i.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            エッセンシャル・インテント
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            たった1つの最重要目標。すべての判断の軸になります。
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            新しいインテント
          </Button>
        )}
      </div>

      {/* New Intent Form */}
      {showForm && (
        <Card className="border-stone-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-stone-600" />
              <CardTitle className="text-base">
                新しいエッセンシャル・インテントを設定
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "form" || step === "feedback" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    期間
                  </label>
                  <div className="flex gap-2">
                    {(["quarterly", "yearly"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriodType(p)}
                        className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                          periodType === p
                            ? "bg-stone-900 text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {p === "quarterly" ? "四半期" : "年間"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    インテント（最重要目標）
                    <span className="text-stone-400 font-normal ml-1">
                      — 具体的で勇気が出るほど明確に
                    </span>
                  </label>
                  <Input
                    placeholder="例：3ヶ月以内に副業で月5万円を稼ぐ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    なぜこれが本質的なのか（任意）
                  </label>
                  <Textarea
                    placeholder="このゴールを達成することで、あなたの人生にどんな変化が生まれますか？"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      開始日
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      終了日
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {step === "form" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleGetAIFeedback}
                      disabled={!title}
                      className="flex-1"
                      variant="outline"
                    >
                      <Sparkles className="w-4 h-4" />
                      AIにフィードバックを求める
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setStep("form");
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                )}

                {step === "feedback" && aiFeedback && (
                  <div className="space-y-4">
                    <AIMessage
                      content={aiFeedback}
                      isStreaming={aiFeedbackStreaming}
                    />
                    {!aiFeedbackStreaming && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmit}
                          loading={loading}
                          className="flex-1"
                          disabled={!endDate}
                        >
                          <Check className="w-4 h-4" />
                          このインテントで決定する
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setStep("form")}
                        >
                          修正する
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowForm(false);
                            setStep("form");
                            setAiFeedback("");
                          }}
                        >
                          キャンセル
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Active Intent */}
      {activeIntent && (
        <Card className="border-stone-900 bg-stone-900 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-stone-400" />
                <span className="text-stone-400 text-xs font-medium uppercase tracking-wide">
                  現在のインテント
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
                アクティブ
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xl font-semibold">{activeIntent.title}</p>
            {activeIntent.description && (
              <p className="text-stone-400 text-sm leading-relaxed">
                {activeIntent.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span>
                {activeIntent.period_type === "quarterly" ? "四半期" : "年間"}
              </span>
              <span>〜</span>
              <span>{formatDate(activeIntent.end_date)}</span>
            </div>
            {activeIntent.ai_feedback && (
              <details className="mt-3">
                <summary className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer hover:text-stone-300 transition-colors">
                  <Sparkles className="w-3 h-3" />
                  AIフィードバックを見る
                  <ChevronDown className="w-3 h-3" />
                </summary>
                <div className="mt-2 text-sm text-stone-300 leading-relaxed bg-stone-800 rounded-xl p-3">
                  {activeIntent.ai_feedback}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past Intents */}
      {intents.filter((i) => !i.is_active).length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-500 mb-3">
            過去のインテント
          </h2>
          <div className="space-y-3">
            {intents
              .filter((i) => !i.is_active)
              .map((intent) => (
                <Card key={intent.id} className="opacity-70">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-700">
                          {intent.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          {formatDate(intent.end_date)} まで
                        </p>
                      </div>
                      <Badge variant="muted">
                        {intent.period_type === "quarterly" ? "四半期" : "年間"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {!activeIntent && !showForm && intents.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-2">
            インテントを設定しましょう
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            エッセンシャル思考の第一歩は、たった1つの最重要目標を決めること。
            すべての判断の軸になります。
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-6">
            <Plus className="w-4 h-4" />
            インテントを設定する
          </Button>
        </div>
      )}
    </div>
  );
}
