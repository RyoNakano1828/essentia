"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Target,
  Sparkles,
  Shield,
  CalendarCheck,
  Focus,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  ArrowUpFromLine,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: Sparkles,
    description: "今日のまとめ",
  },
  {
    href: "/intent",
    label: "エッセンシャル・インテント",
    icon: Target,
    description: "最重要目標（第10章）",
  },
  {
    href: "/daily-focus",
    label: "デイリーフォーカス",
    icon: Focus,
    description: "今日の本質（第19章）",
  },
  {
    href: "/habits",
    label: "習慣トラッカー",
    icon: CalendarCheck,
    description: "毎日チェック（第18章）",
  },
  {
    href: "/commitments",
    label: "90点判定",
    icon: Shield,
    description: "依頼の評価（第9章）",
  },
  {
    href: "/book",
    label: "書籍ガイド",
    icon: BookOpen,
    description: "全章解説",
  },
];

const ESSENTIAL_QUESTIONS = [
  "今、何が最も重要ですか？",
  "絶対にYESと言い切れますか？",
  "これを捨てたら何が生まれますか？",
  "本当にやりたいですか？",
  "これをすると、何を手放しますか？",
  "今日始めるとしたら、やるだろうか？",
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const questionIndex = new Date().getDate() % ESSENTIAL_QUESTIONS.length;
  const todayQuestion = ESSENTIAL_QUESTIONS[questionIndex];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-stone-100 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <div>
            <p className="font-bold text-stone-900 text-sm leading-tight">essentia</p>
            <p className="text-[10px] text-stone-400">より少なく、しかしより良く</p>
          </div>
        </div>
      </div>

      {/* Daily question (第19章：集中) */}
      <div className="mx-3 mt-3 bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
        <p className="text-[10px] text-stone-400 font-medium mb-0.5">今日の問い（第19章）</p>
        <p className="text-xs text-stone-700 font-medium leading-snug">{todayQuestion}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group",
                isActive
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-white" : "text-stone-400 group-hover:text-stone-600"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-tight truncate text-xs">{item.label}</p>
                <p className={cn("text-[10px] truncate mt-0.5", isActive ? "text-stone-300" : "text-stone-400")}>
                  {item.description}
                </p>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-stone-400 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-stone-100 space-y-0.5">
        <Link
          href="/migrate"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-150",
            pathname === "/migrate" && "bg-stone-900 text-white"
          )}
        >
          <ArrowUpFromLine className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className="font-medium text-xs">Notionからデータ移行</span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-150",
            pathname === "/settings" && "bg-stone-900 text-white"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className="font-medium text-xs">設定</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className="font-medium text-xs">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
