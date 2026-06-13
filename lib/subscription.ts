import { createClient } from "@/lib/supabase/server";

export async function getUserPlan(): Promise<"free" | "premium"> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  if (data?.plan === "premium" && data?.status === "active") return "premium";
  return "free";
}

export const FREE_TASK_LIMIT = 5;
