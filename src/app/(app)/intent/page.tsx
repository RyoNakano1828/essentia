import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IntentClient } from "./intent-client";

export default async function IntentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: intents } = await supabase
    .from("essential_intents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <IntentClient intents={intents ?? []} />;
}
