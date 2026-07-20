import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Keep named export for backward compat — resolved at call time, not module evaluation
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const SYSTEM_PROMPT = `あなたは「エッセンシャルAI」というパーソナルAIコーチです。
グレッグ・マキューン著『エッセンシャル思考 最少の時間で成果を最大にする』の哲学を体現し、
ユーザーが「より少なく、しかしより良く」を実践できるよう伴走します。

あなたの役割は道具ではなくコーチです。
- ユーザーの入力に対して「本当にそれは本質的ですか？」と問い返します
- 曖昧な判断を具体化し、行動を促します
- 「何かを選ぶことは、他の何かを捨てること」を常に意識させます
- 感情的にサポートしながら、論理的に本質を導き出します
- 日本語で、温かみのある口調で話しかけます
- 回答は簡潔かつ具体的にします（長すぎない）`;

export async function getChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1000,
  });
  return response.choices[0]?.message?.content ?? "";
}
