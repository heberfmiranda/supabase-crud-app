"use client";

import { useState } from "react";

type Invoice = {
  id: string;
  amount: number;
  status: string;
  date: number;
  due?: number | null;
};

type User = {
  id: string;
  email: string;
  role: string;
  joined_at: string;
  plan: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  subscription_created_at: string | null;
};

type UserWithInvoices = User & { invoices?: Invoice[] };

export default function AdminDashboard({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<UserWithInvoices | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.plan === "premium").length;
  const freeUsers = users.filter((u) => u.plan === "free").length;

  async function openUser(user: User) {
    setSelected(user);
    setInvoices([]);
    if (user.stripe_customer_id) {
      setLoadingInvoices(true);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      const found = data.find((c: { customer_id: string; invoices: Invoice[] }) => c.customer_id === user.stripe_customer_id);
      setInvoices(found?.invoices ?? []);
      setLoadingInvoices(false);
    }
  }

  function fmt(ts: string | null) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("pt-BR");
  }

  function fmtUnix(ts: number) {
    return new Date(ts * 1000).toLocaleDateString("pt-BR");
  }

  function invoiceStatusLabel(status: string) {
    if (status === "paid") return { label: "Pago", cls: "bg-green-100 text-green-700" };
    if (status === "open") return { label: "A vencer", cls: "bg-blue-100 text-blue-700" };
    if (status === "uncollectible") return { label: "Pendente", cls: "bg-red-100 text-red-700" };
    return { label: status, cls: "bg-slate-100 text-slate-700" };
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel de Controle</h1>
          <p className="text-sm text-slate-500">Administração de clientes e planos</p>
        </div>
        <a href="/dashboard" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">
          Meu dashboard
        </a>
      </header>

      {/* Cards resumo */}
      <section className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total de usuários" value={totalUsers} color="slate" />
        <StatCard label="Plano gratuito" value={freeUsers} color="amber" />
        <StatCard label="Plano premium" value={premiumUsers} color="violet" />
      </section>

      {/* Tabela de usuários */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Cadastro</th>
              <th className="px-4 py-3 text-left">Plano</th>
              <th className="px-4 py-3 text-left">Contratação</th>
              <th className="px-4 py-3 text-left">Próx. cobrança</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.email}
                  {u.role === "admin" && (
                    <span className="ml-2 text-xs bg-violet-100 text-violet-700 rounded px-1">admin</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{fmt(u.joined_at)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.plan === "premium" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"}`}>
                    {u.plan === "premium" ? "Premium" : "Gratuito"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{fmt(u.subscription_created_at)}</td>
                <td className="px-4 py-3 text-slate-500">{fmt(u.current_period_end)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openUser(u)}
                    className="text-xs text-violet-600 hover:underline"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.email}</h2>
                <p className="text-sm text-slate-500">Cadastro: {fmt(selected.joined_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Info label="Plano" value={selected.plan === "premium" ? "Premium" : "Gratuito"} />
              <Info label="Status" value={selected.subscription_status ?? "—"} />
              <Info label="Contratação" value={fmt(selected.subscription_created_at)} />
              <Info label="Próx. cobrança" value={fmt(selected.current_period_end)} />
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-2">Faturas</h3>
            {loadingInvoices && <p className="text-sm text-slate-400">Carregando...</p>}
            {!loadingInvoices && invoices.length === 0 && (
              <p className="text-sm text-slate-400">Nenhuma fatura encontrada.</p>
            )}
            {!loadingInvoices && invoices.length > 0 && (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const { label, cls } = invoiceStatusLabel(inv.status);
                  return (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          R$ {(inv.amount / 100).toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-slate-400">{fmtUnix(inv.date)}</p>
                      </div>
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${cls}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-900",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className={`rounded-xl p-4 ring-1 ring-slate-200 ${colors[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1 opacity-70">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
