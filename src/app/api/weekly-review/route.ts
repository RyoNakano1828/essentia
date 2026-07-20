import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("weekly_reviews")
    .upsert(
      {
        user_id: user.id,
        week_start: body.week_start,
        week_end: body.week_end,
        ai_summary: body.ai_summary,
        key_achievement: body.key_achievement,
        time_thief: body.time_thief,
        commitments_to_drop: body.commitments_to_drop,
        essential_action_next_week: body.essential_action_next_week,
      },
      { onConflict: "user_id,week_start" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
