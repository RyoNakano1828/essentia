import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchDatabasePages } from "@/lib/notion";

export interface ImportRequest {
  token: string;
  databaseId: string;
  databaseTitle: string;
  target: "habit_logs" | "daily_focus" | "skip";
  // For habit_logs: which habit template to associate
  habitId?: string;
  // For daily_focus PERMA mapping
  permaColumns?: {
    positive: string;
    meaning: string;
    achieve: string;
    reflection: string;
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: ImportRequest = await request.json();
  const { token, databaseId, target, habitId, permaColumns } = body;

  if (target === "skip") {
    return NextResponse.json({ skipped: true, imported: 0 });
  }

  try {
    const pages = await fetchDatabasePages(token, databaseId);

    if (target === "habit_logs") {
      if (!habitId) {
        return NextResponse.json({ error: "habitId required for habit_logs target" }, { status: 400 });
      }

      // Upsert habit logs — one row per date
      const rows = pages
        .filter((p) => p.date)
        .map((p) => ({
          user_id: user.id,
          habit_id: habitId,
          date: p.date!,
          done: p.done,
          note: p.note || null,
        }));

      if (rows.length === 0) {
        return NextResponse.json({ imported: 0, total: 0 });
      }

      // Batch insert in chunks of 100
      let imported = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error } = await supabase
          .from("habit_logs")
          .upsert(chunk, { onConflict: "habit_id,date", ignoreDuplicates: false });
        if (error) throw new Error(error.message);
        imported += chunk.length;
      }

      return NextResponse.json({ imported, total: pages.length });
    }

    if (target === "daily_focus") {
      // Map to daily_focus: perma scores + reflection
      const rows = pages
        .filter((p) => p.date)
        .map((p) => {
          const positiveScore = permaColumns?.positive
            ? (p.numberValues[permaColumns.positive] ?? null)
            : null;
          const meaningScore = permaColumns?.meaning
            ? (p.numberValues[permaColumns.meaning] ?? null)
            : null;
          const achieveScore = permaColumns?.achieve
            ? (p.numberValues[permaColumns.achieve] ?? null)
            : null;
          const reflectionText = permaColumns?.reflection
            ? (p.textValues[permaColumns.reflection] ?? p.note)
            : p.note;

          return {
            user_id: user.id,
            date: p.date!,
            essential_task: p.textValues["__title"] || "（Notionより移行）",
            completed: p.done,
            perma_positive: positiveScore,
            perma_meaning: meaningScore,
            perma_achieve: achieveScore,
            reflection: reflectionText || null,
            habits_checked: false,
          };
        });

      if (rows.length === 0) {
        return NextResponse.json({ imported: 0, total: 0 });
      }

      let imported = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error } = await supabase
          .from("daily_focus")
          .upsert(chunk, { onConflict: "user_id,date", ignoreDuplicates: false });
        if (error) throw new Error(error.message);
        imported += chunk.length;
      }

      return NextResponse.json({ imported, total: pages.length });
    }

    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
