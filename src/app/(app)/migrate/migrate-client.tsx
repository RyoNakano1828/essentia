"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, AlertCircle, RefreshCw, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HabitOption {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface DbProperty {
  type: string;
  name: string;
}

interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, DbProperty>;
  suggestedTarget: "daily_focus" | "habit_logs";
  isPermaDb: boolean;
  permaColumns: {
    positive: string[];
    meaning: string[];
    achieve: string[];
    reflection: string[];
  };
}

interface MappingState {
  target: "habit_logs" | "daily_focus" | "skip";
  habitId: string;
  permaPositiveCol: string;
  permaMeaningCol: string;
  permaAchieveCol: string;
  permaReflectionCol: string;
}

interface ImportResult {
  status: "idle" | "running" | "done" | "error";
  imported: number;
  total: number;
  message: string;
}

interface MigrateClientProps {
  habits: HabitOption[];
}

function SelectBox({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function DbRow({
  db,
  habits,
  mapping,
  onChange,
  result,
  onImport,
}: {
  db: NotionDatabase;
  habits: HabitOption[];
  mapping: MappingState;
  onChange: (m: Partial<MappingState>) => void;
  result: ImportResult;
  onImport: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const numProps = Object.values(db.properties).filter((p) => p.type === "number");
  const textProps = Object.values(db.properties).filter(
    (p) => p.type === "rich_text" || p.type === "title"
  );

  return (
    <div className="border border-stone-100 rounded-2xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
      >
        <Database className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-stone-900 truncate">{db.title}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {Object.keys(db.properties).length} プロパティ
            {db.isPermaDb && " · PERMAスコア検出"}
          </p>
        </div>
        {result.status === "done" && (
          <Badge variant="essential" className="flex-shrink-0">
            <Check className="w-3 h-3 mr-1" />{result.imported}件完了
          </Badge>
        )}
        {result.status === "error" && (
          <Badge variant="danger" className="flex-shrink-0">エラー</Badge>
        )}
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded config */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-stone-50 pt-3">
          {/* Target selection */}
          <div>
            <p className="text-xs font-medium text-stone-600 mb-1.5">移行先</p>
            <div className="flex gap-2">
              {(["habit_logs", "daily_focus", "skip"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ target: t })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    mapping.target === t
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  {t === "habit_logs" ? "習慣ログ" : t === "daily_focus" ? "デイリー振り返り" : "スキップ"}
                </button>
              ))}
            </div>
            {db.suggestedTarget !== mapping.target && mapping.target !== "skip" && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                推奨：{db.suggestedTarget === "daily_focus" ? "デイリー振り返り（PERMAスコア検出）" : "習慣ログ"}
              </p>
            )}
          </div>

          {/* Habit mapping */}
          {mapping.target === "habit_logs" && (
            <div>
              <p className="text-xs font-medium text-stone-600 mb-1.5">対応する習慣</p>
              <SelectBox
                value={mapping.habitId}
                onChange={(v) => onChange({ habitId: v })}
                placeholder="習慣を選んでください"
                options={habits.map((h) => ({ value: h.id, label: `${h.icon} ${h.name}` }))}
              />
              <p className="text-xs text-stone-400 mt-1">
                このNotionDBの各レコード（日付）= 習慣を実施した日として記録されます
              </p>
            </div>
          )}

          {/* PERMA column mapping */}
          {mapping.target === "daily_focus" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-600">PERMAスコア列のマッピング（任意）</p>
              {[
                {
                  label: "😊 ポジティブ感情",
                  key: "permaPositiveCol",
                  suggested: db.permaColumns.positive[0],
                },
                {
                  label: "✨ 意味・充実感",
                  key: "permaMeaningCol",
                  suggested: db.permaColumns.meaning[0],
                },
                {
                  label: "🏆 達成感",
                  key: "permaAchieveCol",
                  suggested: db.permaColumns.achieve[0],
                },
              ].map(({ label, key, suggested }) => (
                <div key={key}>
                  <p className="text-xs text-stone-500 mb-1">{label}</p>
                  <SelectBox
                    value={(mapping as unknown as Record<string, string>)[key] || suggested || ""}
                    onChange={(v) => onChange({ [key]: v } as Partial<MappingState>)}
                    placeholder="列を選択（なければ空欄）"
                    options={numProps.map((p) => ({ value: p.name, label: p.name }))}
                  />
                </div>
              ))}
              <div>
                <p className="text-xs text-stone-500 mb-1">📝 振り返りテキスト</p>
                <SelectBox
                  value={mapping.permaReflectionCol || db.permaColumns.reflection[0] || ""}
                  onChange={(v) => onChange({ permaReflectionCol: v })}
                  placeholder="列を選択（なければ空欄）"
                  options={textProps.map((p) => ({ value: p.name, label: p.name }))}
                />
              </div>
            </div>
          )}

          {/* Properties preview */}
          <div>
            <p className="text-xs font-medium text-stone-400 mb-1.5">Notionのプロパティ一覧</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(db.properties).map((p) => (
                <span
                  key={p.name}
                  className="text-xs bg-stone-50 text-stone-500 px-2 py-0.5 rounded-md border border-stone-100"
                >
                  {p.name}
                  <span className="text-stone-300 ml-1">{p.type}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Import button */}
          {mapping.target !== "skip" && (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={onImport}
                loading={result.status === "running"}
                disabled={
                  result.status === "running" ||
                  result.status === "done" ||
                  (mapping.target === "habit_logs" && !mapping.habitId)
                }
              >
                {result.status === "done" ? (
                  <><Check className="w-3.5 h-3.5" />移行完了</>
                ) : (
                  <>このDBを移行する</>
                )}
              </Button>
              {result.status === "error" && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{result.message}
                </p>
              )}
              {result.status === "done" && (
                <p className="text-xs text-emerald-600">
                  {result.imported}件のレコードを移行しました
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MigrateClient({ habits }: MigrateClientProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<NotionDatabase[] | null>(null);
  const [error, setError] = useState("");
  const [mappings, setMappings] = useState<Record<string, MappingState>>({});
  const [results, setResults] = useState<Record<string, ImportResult>>({});
  const [allImporting, setAllImporting] = useState(false);

  async function handleConnect() {
    setLoading(true);
    setError("");
    setDatabases(null);

    const res = await fetch("/api/migrate/databases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "接続に失敗しました");
    } else {
      setDatabases(data.databases);
      // Initialize mappings with suggested defaults
      const initial: Record<string, MappingState> = {};
      for (const db of data.databases as NotionDatabase[]) {
        initial[db.id] = {
          target: db.suggestedTarget,
          habitId: "",
          permaPositiveCol: db.permaColumns.positive[0] ?? "",
          permaMeaningCol: db.permaColumns.meaning[0] ?? "",
          permaAchieveCol: db.permaColumns.achieve[0] ?? "",
          permaReflectionCol: db.permaColumns.reflection[0] ?? "",
        };
      }
      setMappings(initial);
    }
    setLoading(false);
  }

  async function importDb(dbId: string) {
    const db = databases?.find((d) => d.id === dbId);
    if (!db) return;
    const mapping = mappings[dbId];

    setResults((prev) => ({
      ...prev,
      [dbId]: { status: "running", imported: 0, total: 0, message: "" },
    }));

    const res = await fetch("/api/migrate/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        databaseId: dbId,
        databaseTitle: db.title,
        target: mapping.target,
        habitId: mapping.habitId || undefined,
        permaColumns:
          mapping.target === "daily_focus"
            ? {
                positive: mapping.permaPositiveCol || undefined,
                meaning: mapping.permaMeaningCol || undefined,
                achieve: mapping.permaAchieveCol || undefined,
                reflection: mapping.permaReflectionCol || undefined,
              }
            : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      setResults((prev) => ({
        ...prev,
        [dbId]: { status: "error", imported: 0, total: 0, message: data.error ?? "エラー" },
      }));
    } else {
      setResults((prev) => ({
        ...prev,
        [dbId]: {
          status: "done",
          imported: data.imported ?? 0,
          total: data.total ?? 0,
          message: "",
        },
      }));
    }
  }

  async function handleImportAll() {
    if (!databases) return;
    setAllImporting(true);
    for (const db of databases) {
      const mapping = mappings[db.id];
      if (!mapping || mapping.target === "skip") continue;
      if (results[db.id]?.status === "done") continue;
      await importDb(db.id);
    }
    setAllImporting(false);
  }

  const doneCount = Object.values(results).filter((r) => r.status === "done").length;
  const totalActive = databases ? databases.filter((db) => mappings[db.id]?.target !== "skip").length : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Notion → Supabase 移行</h1>
        <p className="text-stone-500 mt-1 text-sm">
          過去のNotionデータをessentiaに取り込みます。一度だけ実行してください。
        </p>
      </div>

      {/* Token input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notion Integration Token</CardTitle>
          <CardDescription>
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 underline hover:text-stone-900"
            >
              notion.so/my-integrations
            </a>{" "}
            でインテグレーションを作成し、各データベースにそのインテグレーションをコネクトしてください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="secret_xxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && token && handleConnect()}
              className="font-mono text-sm"
            />
            <Button onClick={handleConnect} loading={loading} disabled={!token}>
              接続する
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
          <p className="text-xs text-stone-400">
            ※ トークンはサーバーでのみ使用され、保存されません
          </p>
        </CardContent>
      </Card>

      {/* Database list */}
      {databases && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-900">
                {databases.length}個のデータベースを検出
              </h2>
              {doneCount > 0 && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {doneCount} / {totalActive} 移行完了
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleConnect} loading={loading}>
                <RefreshCw className="w-3.5 h-3.5" />再読み込み
              </Button>
              <Button
                size="sm"
                onClick={handleImportAll}
                loading={allImporting}
                disabled={allImporting || doneCount >= totalActive}
              >
                すべて一括移行
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {totalActive > 0 && (
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-900 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / totalActive) * 100}%` }}
              />
            </div>
          )}

          <div className="space-y-2">
            {databases.map((db) => (
              <DbRow
                key={db.id}
                db={db}
                habits={habits}
                mapping={mappings[db.id] ?? { target: "skip", habitId: "", permaPositiveCol: "", permaMeaningCol: "", permaAchieveCol: "", permaReflectionCol: "" }}
                onChange={(update) =>
                  setMappings((prev) => ({
                    ...prev,
                    [db.id]: { ...prev[db.id], ...update },
                  }))
                }
                result={results[db.id] ?? { status: "idle", imported: 0, total: 0, message: "" }}
                onImport={() => importDb(db.id)}
              />
            ))}
          </div>

          {doneCount > 0 && doneCount >= totalActive && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-semibold text-emerald-900">移行完了！</p>
              <p className="text-sm text-emerald-700 mt-1">
                すべてのデータがSupabaseに移行されました。
                <a href="/habits" className="underline ml-1">習慣トラッカーで確認する →</a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
