"use client";

import { useState } from "react";
import { Settings, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SettingsClientProps {
  userEmail: string;
  hasHabits: boolean;
}

export function SettingsClient({ userEmail, hasHabits }: SettingsClientProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  async function handleSeedHabits() {
    setSeeding(true);
    const res = await fetch("/api/habits/seed", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setSeedDone(data.seeded);
    }
    setSeeding(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">設定</h1>
        <p className="text-stone-500 mt-1 text-sm">アカウントの設定</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">アカウント</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium">
              {userEmail[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">{userEmail}</p>
              <p className="text-xs text-stone-400">Supabase Auth</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habit seed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">デフォルト習慣を追加</CardTitle>
              <CardDescription>
                Notionの12DBに対応した習慣8項目を一括追加します
              </CardDescription>
            </div>
            {hasHabits && (
              <Badge variant="muted">追加済み</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-2 text-sm text-stone-600">
              {[
                ["🥊", "キックボクシング"],
                ["🧘", "ストレッチ"],
                ["📚", "英語学習"],
                ["😴", "睡眠記録"],
                ["🍽️", "食事記録"],
                ["⚖️", "体重記録"],
                ["🏠", "家事"],
                ["💰", "家計記録"],
              ].map(([icon, name]) => (
                <div key={name} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSeedHabits}
            loading={seeding}
            disabled={hasHabits || seedDone}
            variant={hasHabits || seedDone ? "secondary" : "primary"}
          >
            {hasHabits || seedDone ? (
              <><Check className="w-4 h-4" />追加済みです</>
            ) : (
              <><Settings className="w-4 h-4" />デフォルト習慣を追加する</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">essentia について</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-stone-500 space-y-2">
          <p>グレッグ・マキューン著『エッセンシャル思考』に基づくパーソナルAIコーチ。</p>
          <p className="italic text-stone-400">「より少なく、しかしより良く」</p>
        </CardContent>
      </Card>
    </div>
  );
}
