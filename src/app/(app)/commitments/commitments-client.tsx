"use client";

import { useState } from "react";
import { Shield, Plus, Check, X, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AIMessage } from "@/components/ui/ai-message";
import { Commitment, EssentialIntent } from "@/types";
import { formatDate } from "@/lib/utils";

interface CommitmentsClientProps {
  commitments: Commitment[];
  activeIntent: EssentialIntent | null;
}

function ScoreDisplay({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : score >= 50 ? "#f97316" : "#ef4444";
  const label =
    score >= 90 ? "エッセンシャル" : score >= 70 ? "要検討" : score >= 50 ? "非本質的" : "断るべき";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="10" />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-stone-900">{score}</span>
          <span className="text-[10px] text-stone-500">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export function CommitmentsClient({
  commitments: initialCommitments,
  activeIntent,
}: CommitmentsClientProps) {
  const [commitments, setCommitments] = useState(initialCommitments);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Commitment | null>(null);

  const [title, setTitle] = useState("");
  const [requester, setRequester] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [aiResult, setAiResult] = useState<{
    score: number;
    reasoning: string;
    tradeoff: string;
    decline_gentle: string;
    decline_clear: string;
    decline_final: string;
  } | null>(null);

  async function handleEvaluate() {
    setEvaluating(true);
    setAiResult(null);

    const response = await fetch("/api/commitments/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, requester, deadline, description, activeIntent }),
    });

    if (response.ok) {
      const data = await response.json();
      setAiResult(data);
    }
    setEvaluating(false);
  }

  async function handleSave(status: "accepted" | "declined") {
    if (!aiResult) return;
    setLoading(true);

    const response = await fetch("/api/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        requester,
        deadline,
        description,
        status,
        ...aiResult,
        ai_verdict: aiResult.score >= 90 ? "essential" : "non-essential",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setCommitments([data, ...commitments]);
      setShowForm(false);
      resetForm();
    }
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setRequester("");
    setDeadline("");
    setDescription("");
    setAiResult(null);
  }

  const pending = commitments.filter((c) => c.status === "pending");
  const decided = commitments.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">90点判定</h1>
          <p className="text-stone-500 mt-1 text-sm">
            新しい依頼が来たら、まずAIに評価させましょう。
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            依頼を評価する
          </Button>
        )}
      </div>

      {/* Info card */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
        <p className="text-sm text-stone-700 leading-relaxed">
          <span className="font-semibold">90点ルール</span>：「もしこれが100点満点中90点以上でなければ、引き受けない」。
          曖昧な「良さそう」は全部断る。
        </p>
      </div>

      {/* New commitment form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-600" />
              <CardTitle className="text-base">新しい依頼を評価する</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                依頼内容
              </label>
              <Input
                placeholder="例：プロジェクトXのレビューを来週までに"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  依頼者
                </label>
                <Input
                  placeholder="山田さん"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  期日
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                詳細（任意）
              </label>
              <Textarea
                placeholder="依頼の背景や内容をもう少し教えてください..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* AI Result */}
            {aiResult && (
              <div className="space-y-4 border-t border-stone-100 pt-4">
                <div className="flex items-start gap-6">
                  <ScoreDisplay score={aiResult.score} />
                  <div className="flex-1 space-y-3">
                    <AIMessage content={aiResult.reasoning} />
                    {aiResult.tradeoff && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                        <p className="text-xs font-semibold text-amber-700 mb-1">
                          ⚖️ トレードオフ（第4章）
                        </p>
                        <p className="text-sm text-amber-800">{aiResult.tradeoff}</p>
                      </div>
                    )}
                  </div>
                </div>

                {aiResult.score < 90 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-stone-700">
                      断り文句（コピーして使えます）
                    </p>
                    {[
                      { key: "gentle", label: "やんわり", text: aiResult.decline_gentle },
                      { key: "clear", label: "明確に", text: aiResult.decline_clear },
                      { key: "final", label: "最終手段", text: aiResult.decline_final },
                    ].map((d) => (
                      <div
                        key={d.key}
                        className="bg-stone-50 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="muted">{d.label}</Badge>
                          <button
                            onClick={() => navigator.clipboard.writeText(d.text)}
                            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                          >
                            コピー
                          </button>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          {d.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave("accepted")}
                    loading={loading}
                    variant={aiResult.score >= 90 ? "primary" : "outline"}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4" />
                    引き受ける
                  </Button>
                  <Button
                    onClick={() => handleSave("declined")}
                    loading={loading}
                    variant={aiResult.score < 90 ? "danger" : "ghost"}
                    className="flex-1"
                  >
                    <X className="w-4 h-4" />
                    断る
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            {!aiResult && (
              <div className="flex gap-2">
                <Button
                  onClick={handleEvaluate}
                  loading={evaluating}
                  disabled={!title}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4" />
                  AIに評価してもらう
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  キャンセル
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-500 mb-3">評価済み（決定待ち）</h2>
          <div className="space-y-2">
            {pending.map((c) => (
              <CommitmentRow key={c.id} commitment={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      {/* Decided */}
      {decided.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-500 mb-3">決定済み</h2>
          <div className="space-y-2">
            {decided.map((c) => (
              <CommitmentRow key={c.id} commitment={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      {commitments.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-2">依頼の評価履歴がありません</h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            新しい依頼が来たら、引き受ける前にAIに評価してもらいましょう。
          </p>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-stone-900 text-lg flex-1">
                {selected.title}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="ml-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selected.score !== null && <ScoreDisplay score={selected.score} />}

            {selected.ai_reasoning && (
              <AIMessage content={selected.ai_reasoning} />
            )}

            {selected.ai_verdict === "non-essential" && (
              <div className="space-y-2">
                {[
                  { label: "やんわり", text: selected.decline_gentle },
                  { label: "明確に", text: selected.decline_clear },
                  { label: "最終手段", text: selected.decline_final },
                ]
                  .filter((d) => d.text)
                  .map((d) => (
                    <div key={d.label} className="bg-stone-50 rounded-xl p-3">
                      <Badge variant="muted" className="mb-1">
                        {d.label}
                      </Badge>
                      <p className="text-sm text-stone-600">{d.text}</p>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2 border-t border-stone-100">
              {selected.requester && <span>依頼者: {selected.requester}</span>}
              {selected.deadline && (
                <span>期日: {formatDate(selected.deadline)}</span>
              )}
              <Badge
                variant={
                  selected.status === "accepted"
                    ? "essential"
                    : selected.status === "declined"
                    ? "danger"
                    : "default"
                }
              >
                {selected.status === "accepted"
                  ? "引き受けた"
                  : selected.status === "declined"
                  ? "断った"
                  : "未決定"}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommitmentRow({
  commitment,
  onClick,
}: {
  commitment: Commitment;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all text-left group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 text-sm truncate">
          {commitment.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {commitment.requester && (
            <span className="text-xs text-stone-400">{commitment.requester}</span>
          )}
          {commitment.deadline && (
            <span className="text-xs text-stone-400">
              {formatDate(commitment.deadline)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        {commitment.score !== null && (
          <span
            className={`text-sm font-bold ${
              commitment.score >= 90
                ? "text-emerald-600"
                : commitment.score >= 50
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {commitment.score}点
          </span>
        )}
        <Badge
          variant={
            commitment.status === "accepted"
              ? "essential"
              : commitment.status === "declined"
              ? "danger"
              : "default"
          }
        >
          {commitment.status === "accepted"
            ? "引き受け"
            : commitment.status === "declined"
            ? "断った"
            : "未決定"}
        </Badge>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
      </div>
    </button>
  );
}
