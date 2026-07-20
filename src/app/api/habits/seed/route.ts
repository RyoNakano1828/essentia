import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_HABITS } from "@/types";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only seed if user has no habits yet
  const { count } = await supabase
    .from("habit_templates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ message: "Already seeded", seeded: false });
  }

  const { data, error } = await supabase
    .from("habit_templates")
    .insert(DEFAULT_HABITS.map((h) => ({ ...h, user_id: user.id })))
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Seeded", seeded: true, habits: data });
}
