"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Target,
  Sparkles,
  Shield,
  CalendarDays,
  Focus,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: Sparkles,
    description: "全体サマリー",
  },
  {
    href: "/intent",
    label: "エッセンシャル・インテント",
    icon: Target,
    description: "最重要目標",
  },
  {
    href: "/daily-focus",
    label: "デイリーフォーカス",
    icon: Focus,
    description: "今日の本質",
  },
  {
    href: "/commitments",
    label: "90点判定",
    icon: Shield,
    description: "依頼の評価",
  },
  {
    href: "/habits",
    label: "習慣エッセンシャル診断",
    icon: CalendarDays,
    description: "Notion連携分析",
  },
  {
    href: "/weekly-review",
    label: "ウィークリーレビュー",
    icon: CalendarDays,
    description: "AIと振り返り",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-stone-100 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <div>
            <p className="font-bold text-stone-900 text-sm leading-tight">
              essentia
            </p>
            <p className="text-xs text-stone-400">より少なく、しかしより良く</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
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
                <p className="font-medium leading-tight truncate">{item.label}</p>
                <p
                  className={cn(
                    "text-xs truncate mt-0.5",
                    isActive ? "text-stone-300" : "text-stone-400"
                  )}
                >
                  {item.description}
                </p>
              </div>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-stone-100 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-150",
            pathname === "/settings" && "bg-stone-900 text-white"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className="font-medium">設定</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-stone-400" />
          <span className="font-medium">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
