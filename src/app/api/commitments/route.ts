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
    .from("commitments")
    .insert({
      user_id: user.id,
      title: body.title,
      requester: body.requester,
      deadline: body.deadline || null,
      description: body.description,
      score: body.score,
      ai_verdict: body.ai_verdict,
      ai_reasoning: body.reasoning,
      decline_gentle: body.decline_gentle,
      decline_clear: body.decline_clear,
      decline_final: body.decline_final,
      status: body.status,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
