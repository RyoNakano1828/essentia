import Link from "next/link";
import { ArrowRight, Target, Shield, CalendarDays, Focus } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-bold text-stone-900">essentia</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
          >
            はじめる
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 text-xs text-stone-600 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            エッセンシャル思考 × AI コーチング
          </div>
          <h1 className="text-5xl font-bold text-stone-900 leading-tight mb-6">
            より少なく、
            <br />
            しかしより良く。
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed mb-10">
            99%の無駄を捨て、1%の本質だけに全力を注ぐ。
            <br />
            AIが伴走するパーソナルエッセンシャルコーチ。
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 h-12 px-6 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-700 transition-colors"
            >
              無料ではじめる
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center h-12 px-6 border border-stone-200 bg-white text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
          {[
            {
              icon: Target,
              title: "エッセンシャル・インテント",
              desc: "たった1つの最重要目標を設定。すべての判断の軸に。",
            },
            {
              icon: Shield,
              title: "90点判定",
              desc: "新しい依頼をAIが多角的に評価。断り文句も自動生成。",
            },
            {
              icon: CalendarDays,
              title: "習慣診断",
              desc: "Notionデータを分析し、本当に守るべき習慣を特定。",
            },
            {
              icon: Focus,
              title: "デイリーフォーカス",
              desc: "毎朝1つの問いで今日の本質を決め、夜に振り返る。",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-stone-700" />
                </div>
                <h3 className="font-semibold text-stone-900 text-sm mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div className="mt-20 text-center">
          <blockquote className="text-xl text-stone-600 font-light italic leading-relaxed max-w-xl mx-auto">
            「もし自分のプライオリティを自分で決めなければ、
            <br />
            誰かが代わりに決めてしまう。」
          </blockquote>
          <p className="text-sm text-stone-400 mt-3">
            — グレッグ・マキューン『エッセンシャル思考』
          </p>
        </div>
      </main>
    </div>
  );
}
