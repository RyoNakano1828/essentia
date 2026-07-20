import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Deactivate all existing active intents
  await supabase
    .from("essential_intents")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("essential_intents")
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      period_type: body.period_type,
      start_date: body.start_date,
      end_date: body.end_date,
      ai_feedback: body.ai_feedback,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
