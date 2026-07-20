import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category, icon } = await request.json();

  const { data: existing } = await supabase
    .from("habit_templates")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (existing?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("habit_templates")
    .insert({ user_id: user.id, name, category: category ?? "その他", icon: icon ?? "✅", sort_order: nextOrder })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
