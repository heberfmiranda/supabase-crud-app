import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/dashboard");

  const supabase = await createClient();

  // Busca todos os usuários com suas assinaturas
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role, created_at");

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*");

  const users = (profiles ?? []).map((p) => {
    const sub = (subscriptions ?? []).find((s) => s.user_id === p.id);
    return {
      id: p.id,
      email: p.email,
      role: p.role,
      joined_at: p.created_at,
      plan: sub?.plan ?? "free",
      subscription_status: sub?.status ?? null,
      stripe_subscription_id: sub?.stripe_subscription_id ?? null,
      stripe_customer_id: sub?.stripe_customer_id ?? null,
      current_period_end: sub?.current_period_end ?? null,
      subscription_created_at: sub?.created_at ?? null,
    };
  });

  return <AdminDashboard users={users} />;
}
