import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CommitmentsClient } from "./commitments-client";

export default async function CommitmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [commitmentsRes, intentRes] = await Promise.all([
    supabase
      .from("commitments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("essential_intents")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
  ]);

  return (
    <CommitmentsClient
      commitments={commitmentsRes.data ?? []}
      activeIntent={intentRes.data}
    />
  );
}
