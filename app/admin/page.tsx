import { redirect } from "next/navigation";
import { isAdmin, supabaseAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/subscription";
import Sidebar from "@/components/Sidebar";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/dashboard");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plan = await getUserPlan();

  // Busca todos os usuários com suas assinaturas via service role (bypassa RLS)
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, blocked, created_at");

  const { data: subscriptions } = await supabaseAdmin
    .from("subscriptions")
    .select("*");

  const users = (profiles ?? []).map((p) => {
    const sub = (subscriptions ?? []).find((s) => s.user_id === p.id);
    return {
      id: p.id,
      email: p.email,
      role: p.role,
      blocked: p.blocked ?? false,
      joined_at: p.created_at,
      plan: sub?.plan ?? "free",
      subscription_status: sub?.status ?? null,
      stripe_subscription_id: sub?.stripe_subscription_id ?? null,
      stripe_customer_id: sub?.stripe_customer_id ?? null,
      current_period_end: sub?.current_period_end ?? null,
      subscription_created_at: sub?.created_at ?? null,
    };
  });

  return (
    <div className="flex min-h-screen" style={{ background: "#0d1117" }}>
      <Sidebar email={user?.email ?? ""} plan={plan} isAdmin={true} activeItem="/admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div>
            <h1 className="text-lg font-bold text-white">Painel de Controle</h1>
            <p className="text-xs text-white/40">Administração de clientes e planos</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              Sair
            </button>
          </form>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          <AdminDashboard users={users} />
        </div>
      </div>
    </div>
  );
}
