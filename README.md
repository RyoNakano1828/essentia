# essentia

> より少なく、しかしより良く。

グレッグ・マキューン著『エッセンシャル思考 最少の時間で成果を最大にする』を実践するパーソナルAIコーチ。

## 機能

1. **エッセンシャル・インテント設定** — 四半期・年単位でたった1つの最重要目標を設定
2. **デイリーフォーカス** — 毎朝1つの問いかけで今日の本質を決める
3. **90点判定（AI）** — 新しい依頼をAIが多角的に評価し、断り文句を自動生成
4. **習慣エッセンシャル診断** — Notionデータを分析し、本当に守るべき習慣を特定
5. **AIウィークリーレビュー** — AIと対話しながら振り返り・来週の本質を決める

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 + TypeScript + Tailwind CSS |
| バックエンド | Next.js API Routes |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |
| AI | OpenAI API (GPT-4o) |
| Notion連携 | Notion API |
| デプロイ | Vercel |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Supabaseのセットアップ

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. `supabase/migrations/001_initial_schema.sql` をSQL Editorで実行
3. Project URL と anon key を `.env.local` に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

## Notion連携のセットアップ

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) でインテグレーションを作成
2. 「内部インテグレーション トークン」をコピー
3. 分析したいNotionデータベースをインテグレーションと共有
4. アプリの設定画面でトークンを入力

## デプロイ（Vercel）

```bash
# Vercel CLIでデプロイ
npx vercel

# または GitHub連携でプッシュするだけ
git push origin main
```

Vercelのダッシュボードで環境変数を設定：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
