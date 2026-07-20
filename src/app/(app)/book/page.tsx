import Link from "next/link";
import { Target, Shield, CalendarDays, Focus, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PARTS = [
  {
    part: "PART 1",
    subtitle: "エッセンシャル思考とは何か",
    color: "bg-stone-900",
    textColor: "text-white",
    chapters: [
      {
        num: 2,
        title: "選択",
        summary:
          "選ぶという行為は権利であり、能力である。選択肢に支配されるのではなく、選択する力を取り戻すことが出発点。",
        keyQuote: "「自分が選んだことだけをやる」という主体的な選択に基づく。",
        appFeature: null,
      },
      {
        num: 3,
        title: "ノイズ",
        summary:
          "80対20の法則——成果の大半は少数の重要な行動から生まれる。大多数の選択肢は価値が低く、少数の極めて重要なチャンスだけが大きな見返りをもたらす。",
        keyQuote: "「まあまあ良い機会」はノイズ。「絶対にやりたい」だけが本物。",
        appFeature: null,
      },
      {
        num: 4,
        title: "トレードオフ",
        summary:
          "何かに「Yes」と言うことは、必然的に他の何かに「No」と言うことを意味する。トレードオフを直視し、意識的に選択することがエッセンシャル思考の核心。",
        keyQuote: "「これとあれ、両方できる」ではなく「何を捨てて、何を選ぶか」を問う。",
        appFeature: { label: "90点判定", href: "/commitments" },
      },
    ],
  },
  {
    part: "PART 2",
    subtitle: "見極める技術",
    color: "bg-blue-50",
    textColor: "text-blue-900",
    chapters: [
      {
        num: 5,
        title: "孤独",
        summary:
          "毎日・毎年、誰にも邪魔されない思考の時間を確保する。目の前の選択肢にすぐ飛びつかず、調査と熟慮に時間をかける。",
        keyQuote: "ニュートン・ダーウィン・アインシュタインも孤独な思考時間を意図的に確保していた。",
        appFeature: { label: "デイリーフォーカス", href: "/daily-focus" },
      },
      {
        num: 6,
        title: "洞察",
        summary:
          "膨大な情報の中から本質的なシグナルを見抜く力。「全体を見渡す視点」で情報の核心を掴み取る。",
        keyQuote: "ジャーナリングや日記は洞察を深める最良のツール。",
        appFeature: { label: "ウィークリーレビュー", href: "/weekly-review" },
      },
      {
        num: 7,
        title: "遊び",
        summary:
          "遊び心と余白がイノベーションを生む。「無駄」に見える時間が、重要なことへの洞察を深める。",
        keyQuote: "遊びは本質的な選択を促す重要な要素。",
        appFeature: null,
      },
      {
        num: 8,
        title: "睡眠",
        summary:
          "1時間の眠りが数時間分の成果を生む。睡眠を惜しんで働くことは非エッセンシャル思考の典型。高業績者は8時間以上眠る。",
        keyQuote: "睡眠こそが最高のパフォーマンスを生む土台。",
        appFeature: { label: "習慣診断", href: "/habits" },
      },
      {
        num: 9,
        title: "選抜（90点ルール）",
        summary:
          "選択肢を100点満点で評価し、90点未満はすべて「0点（＝不要）」として切り捨てる。「絶対にYESと言い切れるか」だけが判断基準。",
        keyQuote: "90点未満 = 事実上の0点。明確な判断基準が決断を楽にする。",
        appFeature: { label: "90点判定", href: "/commitments" },
      },
    ],
  },
  {
    part: "PART 3",
    subtitle: "捨てる技術",
    color: "bg-amber-50",
    textColor: "text-amber-900",
    chapters: [
      {
        num: 10,
        title: "目標（エッセンシャル・インテント）",
        summary:
          "「本質的な意図」を定める。明確で具体的な目標がなければ、何を捨てるべきかわからない。「感動的なほど具体的で、意味深い目標」が理想。",
        keyQuote: "「品質を上げる」ではなく「3ヶ月で○○を達成する」のように具体化する。",
        appFeature: { label: "インテント設定", href: "/intent" },
      },
      {
        num: 11,
        title: "拒否",
        summary:
          "断固として、しかし上手に断る技術を身につける。「ノー」と言うことは相手への不敬ではなく、自分の最高の貢献を守るための手段。",
        keyQuote: "「あなたへのNo」ではなく「そのリクエストへのNo」。",
        appFeature: { label: "90点判定（断り文句）", href: "/commitments" },
      },
      {
        num: 12,
        title: "キャンセル",
        summary:
          "サンクコストバイアスを克服し、損切りをためらわない。「もったいない」ではなく「今から最善を尽くす」視点に切り替える。",
        keyQuote: "「これを今日始めるとしたら、やるだろうか？」と自問する。",
        appFeature: { label: "ウィークリーレビュー", href: "/weekly-review" },
      },
      {
        num: 13,
        title: "編集",
        summary:
          "映画の編集のように、余剰を削り本質を取り出す。削除・圧縮・修正を通じて、より少なくより良い状態を作り出す。",
        keyQuote: "「何を加えるか」ではなく「何を削れるか」を常に問う。",
        appFeature: null,
      },
      {
        num: 14,
        title: "線引き",
        summary:
          "境界線を設けることで自由を手に入れる。境界線のない人は他者の優先事項の奴隷になる。境界線は事前に設ける。",
        keyQuote: "「いつも断れない人だと思われたら、断れなくなる」",
        appFeature: { label: "90点判定（断り文句）", href: "/commitments" },
      },
    ],
  },
  {
    part: "PART 4",
    subtitle: "しくみ化の技術",
    color: "bg-emerald-50",
    textColor: "text-emerald-900",
    chapters: [
      {
        num: 15,
        title: "バッファ",
        summary:
          "最悪の事態を想定し、余裕（バッファ）を事前に確保する。計画は必ずズレる。15〜50%の余剰時間を見込んでおく。",
        keyQuote: "「ちょうど良い計画」は危険。「十分すぎる余白」が安心を生む。",
        appFeature: null,
      },
      {
        num: 16,
        title: "削減",
        summary:
          "制約を取り除くのではなく、最大のボトルネックを特定して集中的に解消する。仕事量を減らして成果を増やす逆説的アプローチ。",
        keyQuote: "「何をすればいいか」ではなく「何が邪魔しているか」を問う。",
        appFeature: { label: "ウィークリーレビュー", href: "/weekly-review" },
      },
      {
        num: 17,
        title: "前進",
        summary:
          "小さな一歩を積み重ねる。完璧な計画より「最小限の実行可能な進歩」を優先し、モメンタムを作る。",
        keyQuote: "「最小限の実行可能なステップは何か？」を常に問う。",
        appFeature: { label: "デイリーフォーカス", href: "/daily-focus" },
      },
      {
        num: 18,
        title: "習慣",
        summary:
          "本質的な行動を習慣化し、意識のエネルギーを節約する。習慣は意思力なしに重要な行動を自動実行するしくみ。",
        keyQuote: "習慣のトリガー（きっかけ）を設計することで定着を促進する。",
        appFeature: { label: "習慣診断", href: "/habits" },
      },
      {
        num: 19,
        title: "集中",
        summary:
          "「今、何が重要か」を常に問い続ける。過去の後悔・未来の不安ではなく、現在の本質に集中する。",
        keyQuote: "マルチタスクは幻想——同時に複数のことに集中することはできない。",
        appFeature: { label: "デイリーフォーカス", href: "/daily-focus" },
      },
      {
        num: 20,
        title: "未来",
        summary:
          "エッセンシャル思考を「生き方」として定着させる。一度の選択ではなく、継続的なライフスタイルへ。",
        keyQuote: "非エッセンシャルな生き方に戻る誘惑は常にある——意識的に選び続ける。",
        appFeature: null,
      },
    ],
  },
];

const FEATURE_MAP = [
  {
    icon: Target,
    label: "エッセンシャル・インテント",
    href: "/intent",
    chapters: ["第10章：目標"],
    description: "「本質的な意図」を1つ決め、すべての判断の軸にする",
  },
  {
    icon: Focus,
    label: "デイリーフォーカス",
    href: "/daily-focus",
    chapters: ["第5章：孤独", "第17章：前進", "第19章：集中"],
    description: "毎朝1つの問いで今日の本質を決め、小さな一歩を積み重ねる",
  },
  {
    icon: Shield,
    label: "90点判定",
    href: "/commitments",
    chapters: ["第4章：トレードオフ", "第9章：選抜", "第11章：拒否", "第14章：線引き"],
    description: "90点未満の依頼はすべて断る。断り文句も自動生成",
  },
  {
    icon: CalendarDays,
    label: "習慣診断",
    href: "/habits",
    chapters: ["第8章：睡眠", "第18章：習慣"],
    description: "Notionデータから「守るべき本質的な習慣」を特定",
  },
  {
    icon: CalendarDays,
    label: "ウィークリーレビュー",
    href: "/weekly-review",
    chapters: ["第6章：洞察", "第12章：キャンセル", "第16章：削減"],
    description: "週次でパターンを洞察し、手放すコミットメントを特定する",
  },
];

export default function BookPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-stone-600" />
          <h1 className="text-2xl font-bold text-stone-900">
            エッセンシャル思考 — 書籍ガイド
          </h1>
        </div>
        <p className="text-stone-500 text-sm leading-relaxed">
          グレッグ・マキューン著『エッセンシャル思考 最少の時間で成果を最大にする』の全章を、
          <br />
          essentia の機能とマッピングして解説します。
        </p>
      </div>

      {/* Core philosophy */}
      <div className="bg-stone-900 text-white rounded-2xl p-6">
        <p className="text-xs text-stone-400 font-medium uppercase tracking-widest mb-3">
          核心メッセージ
        </p>
        <p className="text-2xl font-bold leading-snug mb-3">
          「より少なく、しかしより良く。」
        </p>
        <p className="text-stone-300 text-sm leading-relaxed">
          99%の無駄を捨て、1%の本質だけに全力を注ぐことで、最大の成果と充実感を得る。
          非エッセンシャルは「全部できる」という思い込みから始まる。
          エッセンシャル思考は「自分が選んだことだけをやる」という主体性から始まる。
        </p>
      </div>

      {/* Feature mapping */}
      <div>
        <h2 className="text-base font-semibold text-stone-900 mb-4">
          機能 × 書籍の章マッピング
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {FEATURE_MAP.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0 group-hover:bg-stone-100 transition-colors">
                  <Icon className="w-5 h-5 text-stone-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-stone-900 text-sm">
                      {feature.label}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                  </div>
                  <p className="text-xs text-stone-500 mb-2">{feature.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.chapters.map((ch) => (
                      <Badge key={ch} variant="muted" className="text-xs">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Chapters by part */}
      <div className="space-y-6">
        <h2 className="text-base font-semibold text-stone-900">全章解説</h2>
        {PARTS.map((part) => (
          <div key={part.part}>
            <div
              className={`${part.color} rounded-xl px-4 py-2.5 flex items-center justify-between mb-3`}
            >
              <span
                className={`text-xs font-bold uppercase tracking-widest ${part.textColor}`}
              >
                {part.part}
              </span>
              <span className={`text-sm font-semibold ${part.textColor}`}>
                {part.subtitle}
              </span>
            </div>
            <div className="space-y-2">
              {part.chapters.map((chapter) => (
                <Card key={chapter.num} className="overflow-hidden">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0">
                        {chapter.num}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-semibold text-stone-900 text-sm">
                            {chapter.title}
                          </p>
                          {chapter.appFeature && (
                            <Link href={chapter.appFeature.href}>
                              <Badge variant="essential" className="text-xs hover:opacity-80 transition-opacity">
                                {chapter.appFeature.label} →
                              </Badge>
                            </Link>
                          )}
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed mb-2">
                          {chapter.summary}
                        </p>
                        <div className="bg-stone-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-stone-500 italic">
                            「{chapter.keyQuote}」
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Final chapter */}
        <Card className="border-stone-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                最終
              </div>
              <CardTitle className="text-sm">エッセンシャル思考のリーダーシップ</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 leading-relaxed mb-2">
              チームや組織にエッセンシャル思考を広め、メンバー全員が本質的な貢献に集中できる環境を作る。
            </p>
            <div className="bg-stone-50 rounded-lg px-3 py-2">
              <p className="text-xs text-stone-500 italic">
                「エッセンシャルな組織では、全員が『最も重要な貢献』に集中できる。」
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
