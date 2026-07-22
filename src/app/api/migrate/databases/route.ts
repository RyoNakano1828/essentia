import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listNotionDatabases, fetchDatabasePages, detectPermaColumns } from "@/lib/notion";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Notion token is required" }, { status: 400 });

  try {
    const databases = await listNotionDatabases(token);

    // Annotate each DB with PERMA detection and estimated record count
    const enriched = await Promise.all(
      databases.map(async (db) => {
        const perma = detectPermaColumns(db.properties);
        const isPermaDb = perma.positive.length > 0 || perma.meaning.length > 0 || perma.achieve.length > 0;
        return {
          ...db,
          permaColumns: perma,
          isPermaDb,
          suggestedTarget: isPermaDb ? "daily_focus" : "habit_logs",
        };
      })
    );

    return NextResponse.json({ databases: enriched });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
