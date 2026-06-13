"use client";

import { useState, useMemo } from "react";

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
  blocked: boolean;
  joined_at: string;
  plan: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  subscription_created_at: string | null;
};

type SortKey = "email" | "joined_at" | "plan" | "subscription_created_at" | "current_period_end";

export default function AdminDashboard({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selected, setSelected] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [saving, setSaving] = useState(false);

  // Filtros e ordenação
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "premium">("all");
  const [filterBlocked, setFilterBlocked] = useState<"all" | "active" | "blocked">("all");
  const [sortKey, setSortKey] = useState<SortKey>("joined_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected2, setSelected2] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) list = list.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));
    if (filterPlan !== "all") list = list.filter((u) => u.plan === filterPlan);
    if (filterBlocked === "active") list = list.filter((u) => !u.blocked);
    if (filterBlocked === "blocked") list = list.filter((u) => u.blocked);
    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [users, search, filterPlan, filterBlocked, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  async function openUser(user: User) {
    setSelected(user);
    setEditMode(false);
    setEditEmail(user.email);
    setEditPlan(user.plan);
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

  async function saveEdit() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selected.id, email: editEmail, plan: editPlan }),
    });
    setUsers((prev) => prev.map((u) => u.id === selected.id ? { ...u, email: editEmail, plan: editPlan } : u));
    setSelected((s) => s ? { ...s, email: editEmail, plan: editPlan } : s);
    setEditMode(false);
    setSaving(false);
  }

  async function toggleBlock(user: User) {
    const newBlocked = !user.blocked;
    if (!confirm(newBlocked ? `Bloquear ${user.email}?` : `Desbloquear ${user.email}?`)) return;
    await fetch("/api/admin/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, blocked: newBlocked }),
    });
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, blocked: newBlocked } : u));
    setSelected((s) => s?.id === user.id ? { ...s, blocked: newBlocked } : s);
  }

  async function deleteUser(user: User) {
    if (!confirm(`Excluir permanentemente ${user.email}? Esta ação não pode ser desfeita.`)) return;
    await fetch("/api/admin/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setSelected(null);
  }

  async function bulkBlock(blocked: boolean) {
    if (!confirm(`${blocked ? "Bloquear" : "Desbloquear"} ${selected2.size} usuário(s)?`)) return;
    for (const uid of selected2) {
      await fetch("/api/admin/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid, blocked }),
      });
    }
    setUsers((prev) => prev.map((u) => selected2.has(u.id) ? { ...u, blocked } : u));
    setSelected2(new Set());
  }

  async function bulkDelete() {
    if (!confirm(`Excluir permanentemente ${selected2.size} usuário(s)?`)) return;
    for (const uid of selected2) {
      await fetch("/api/admin/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid }),
      });
    }
    setUsers((prev) => prev.filter((u) => !selected2.has(u.id)));
    setSelected2(new Set());
  }

  function toggleSelect(id: string) {
    setSelected2((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected2.size === filtered.length) setSelected2(new Set());
    else setSelected2(new Set(filtered.map((u) => u.id)));
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

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.plan === "premium").length;
  const freeUsers = users.filter((u) => u.plan === "free").length;
  const blockedUsers = users.filter((u) => u.blocked).length;

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
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
      <section className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={totalUsers} color="slate" />
        <StatCard label="Gratuito" value={freeUsers} color="amber" />
        <StatCard label="Premium" value={premiumUsers} color="violet" />
        <StatCard label="Bloqueados" value={blockedUsers} color="red" />
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 flex-1 min-w-[180px]"
        />
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value as "all" | "free" | "premium")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
          <option value="all">Todos os planos</option>
          <option value="free">Gratuito</option>
          <option value="premium">Premium</option>
        </select>
        <select value={filterBlocked} onChange={(e) => setFilterBlocked(e.target.value as "all" | "active" | "blocked")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>

      {/* Ações em massa */}
      {selected2.size > 0 && (
        <div className="flex items-center gap-3 mb-3 rounded-lg bg-slate-100 px-4 py-2 text-sm">
          <span className="font-medium text-slate-700">{selected2.size} selecionado(s)</span>
          <button onClick={() => bulkBlock(true)} className="rounded px-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200">Bloquear</button>
          <button onClick={() => bulkBlock(false)} className="rounded px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200">Desbloquear</button>
          <button onClick={bulkDelete} className="rounded px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200">Excluir</button>
          <button onClick={() => setSelected2(new Set())} className="ml-auto text-slate-400 hover:text-slate-600">✕ Limpar</button>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" checked={selected2.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll} />
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700" onClick={() => toggleSort("email")}>
                Email{sortIcon("email")}
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700" onClick={() => toggleSort("joined_at")}>
                Cadastro{sortIcon("joined_at")}
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700" onClick={() => toggleSort("plan")}>
                Plano{sortIcon("plan")}
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700" onClick={() => toggleSort("subscription_created_at")}>
                Contratação{sortIcon("subscription_created_at")}
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700" onClick={() => toggleSort("current_period_end")}>
                Próx. cobrança{sortIcon("current_period_end")}
              </th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className={`hover:bg-slate-50 ${u.blocked ? "opacity-50" : ""}`}>
                <td className="px-3 py-3 text-center">
                  <input type="checkbox" checked={selected2.has(u.id)} onChange={() => toggleSelect(u.id)} />
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.email}
                  {u.role === "admin" && <span className="ml-2 text-xs bg-violet-100 text-violet-700 rounded px-1">admin</span>}
                  {u.blocked && <span className="ml-2 text-xs bg-red-100 text-red-700 rounded px-1">bloqueado</span>}
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
                  <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${u.blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {u.blocked ? "Bloqueado" : "Ativo"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openUser(u)} className="text-xs text-violet-600 hover:underline">Detalhes</button>
                  <button onClick={() => toggleBlock(u)} className={`text-xs hover:underline ${u.blocked ? "text-green-600" : "text-amber-600"}`}>
                    {u.blocked ? "Desbloquear" : "Bloquear"}
                  </button>
                  <button onClick={() => deleteUser(u)} className="text-xs text-red-500 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalhes */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.email}</h2>
                <p className="text-sm text-slate-500">Cadastro: {fmt(selected.joined_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            {editMode ? (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Plano</label>
                  <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
                    <option value="free">Gratuito</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Info label="Plano" value={selected.plan === "premium" ? "Premium" : "Gratuito"} />
                  <Info label="Status" value={selected.blocked ? "Bloqueado" : (selected.subscription_status ?? "Ativo")} />
                  <Info label="Contratação" value={fmt(selected.subscription_created_at)} />
                  <Info label="Próx. cobrança" value={fmt(selected.current_period_end)} />
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setEditMode(true)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    Editar dados
                  </button>
                  <button onClick={() => toggleBlock(selected)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${selected.blocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                    {selected.blocked ? "Desbloquear" : "Bloquear acesso"}
                  </button>
                  <button onClick={() => deleteUser(selected)}
                    className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200">
                    Excluir conta
                  </button>
                </div>
              </>
            )}

            <h3 className="text-sm font-semibold text-slate-700 mb-2">Faturas</h3>
            {loadingInvoices && <p className="text-sm text-slate-400">Carregando...</p>}
            {!loadingInvoices && invoices.length === 0 && <p className="text-sm text-slate-400">Nenhuma fatura encontrada.</p>}
            {!loadingInvoices && invoices.length > 0 && (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const { label, cls } = invoiceStatusLabel(inv.status);
                  return (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-700">R$ {(inv.amount / 100).toFixed(2).replace(".", ",")}</p>
                        <p className="text-xs text-slate-400">{fmtUnix(inv.date)}{inv.due ? ` · vence ${fmtUnix(inv.due)}` : ""}</p>
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
    red: "bg-red-50 text-red-700",
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
