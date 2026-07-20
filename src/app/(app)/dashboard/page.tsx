import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Target, Shield, CalendarDays, Focus, ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [intentsRes, focusRes, commitmentsRes] = await Promise.all([
    supabase
      .from("essential_intents")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("daily_focus")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", new Date().toISOString().split("T")[0])
      .single(),
    supabase
      .from("commitments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const activeIntent = intentsRes.data?.[0];
  const todayFocus = focusRes.data;
  const pendingCommitments = commitmentsRes.data ?? [];

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "おはようございます"
      : today.getHours() < 18
      ? "こんにちは"
      : "こんばんは";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{greeting} 👋</h1>
        <p className="text-stone-500 mt-1 text-sm">
          {formatDate(today)} — 本質に集中する1日を。
        </p>
      </div>

      {/* Today's Focus Banner */}
      <div className="bg-stone-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Focus className="w-4 h-4 text-stone-400" />
              <span className="text-stone-400 text-xs font-medium uppercase tracking-wide">
                今日のエッセンシャル
              </span>
            </div>
            {todayFocus ? (
              <>
                <p className="text-xl font-semibold leading-snug">
                  {todayFocus.essential_task}
                </p>
                {todayFocus.completed && (
                  <Badge className="mt-3 bg-emerald-500/20 text-emerald-300 border-0">
                    ✓ 完了
                  </Badge>
                )}
              </>
            ) : (
              <>
                <p className="text-stone-300 text-sm">
                  今日の本質がまだ設定されていません
                </p>
                <Link
                  href="/daily-focus"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
                >
                  今日の本質を決める
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Intent Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-stone-500" />
              <CardTitle className="text-base">エッセンシャル・インテント</CardTitle>
            </div>
            <Link
              href="/intent"
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5 transition-colors"
            >
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
                <span className="text-xs text-stone-400">
                  {formatDate(activeIntent.end_date)} まで
                </span>
              </div>
              {activeIntent.description && (
                <p className="text-sm text-stone-500 mt-3 leading-relaxed">
                  {activeIntent.description}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-stone-500 mb-3">
                最重要目標がまだ設定されていません
              </p>
              <Link
                href="/intent"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-900 hover:underline"
              >
                インテントを設定する <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Commitments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-500" />
              <CardTitle className="text-base">評価待ちの依頼</CardTitle>
            </div>
            <Link
              href="/commitments"
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5 transition-colors"
            >
              すべて見る <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {pendingCommitments.length > 0 ? (
            <div className="space-y-3">
              {pendingCommitments.map((c) => (
                <Link
                  key={c.id}
                  href={`/commitments/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">{c.title}</p>
                    {c.requester && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        依頼者: {c.requester}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.score !== null && (
                      <Badge
                        variant={
                          c.score >= 90
                            ? "essential"
                            : c.score >= 50
                            ? "warning"
                            : "danger"
                        }
                      >
                        {c.score}点
                      </Badge>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-stone-500 mb-3">
                評価待ちの依頼はありません
              </p>
              <Link
                href="/commitments/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-900 hover:underline"
              >
                新しい依頼を評価する <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            href: "/weekly-review",
            icon: CalendarDays,
            label: "ウィークリーレビュー",
            desc: "今週を振り返る",
          },
          {
            href: "/habits",
            icon: Target,
            label: "習慣診断",
            desc: "Notion分析を実行",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-2xl border border-stone-100 p-4 hover:border-stone-200 hover:shadow-sm transition-all group"
            >
              <Icon className="w-5 h-5 text-stone-500 mb-3 group-hover:text-stone-700 transition-colors" />
              <p className="font-medium text-stone-900 text-sm">{action.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{action.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
