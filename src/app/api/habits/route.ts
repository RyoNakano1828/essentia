import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { habits } = await request.json();

  // Clear existing habits
  await supabase.from("habits").delete().eq("user_id", user.id);

  const insertData = habits.map(
    (h: { name: string; reason: string; notion_db: string | null; is_active: boolean }) => ({
      user_id: user.id,
      name: h.name,
      description: h.reason,
      notion_db_name: h.notion_db,
      is_essential: true,
      ai_analysis: h.reason,
    })
  );

  const { data, error } = await supabase
    .from("habits")
    .insert(insertData)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
