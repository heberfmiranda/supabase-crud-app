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
    <div className="max-w-6xl mx-auto">

      {/* Cards resumo */}
      <section className="grid grid-cols-4 gap-3 mb-4">
        <StatCard label="Total" value={totalUsers} color="slate" />
        <StatCard label="Gratuito" value={freeUsers} color="amber" />
        <StatCard label="Premium" value={premiumUsers} color="violet" />
        <StatCard label="Bloqueados" value={blockedUsers} color="red" />
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          <input key="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por email..."
            className="rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none flex-1 min-w-[180px]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />,
          <select key="plan" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value as "all" | "free" | "premium")}
            className="rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="all">Todos os planos</option>
            <option value="free">Gratuito</option>
            <option value="premium">Premium</option>
          </select>,
          <select key="blocked" value={filterBlocked} onChange={(e) => setFilterBlocked(e.target.value as "all" | "active" | "blocked")}
            className="rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        ]}
      </div>

      {/* Ações em massa */}
      {selected2.size > 0 && (
        <div className="flex items-center gap-3 mb-3 rounded-lg px-4 py-2 text-sm"
          style={{ background: "rgba(233,30,140,0.1)", border: "1px solid rgba(233,30,140,0.2)" }}>
          <span className="font-medium text-white/70">{selected2.size} selecionado(s)</span>
          <button onClick={() => bulkBlock(true)} className="rounded px-2 py-1 text-xs text-amber-400 hover:bg-amber-400/10">Bloquear</button>
          <button onClick={() => bulkBlock(false)} className="rounded px-2 py-1 text-xs text-green-400 hover:bg-green-400/10">Desbloquear</button>
          <button onClick={bulkDelete} className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10">Excluir</button>
          <button onClick={() => setSelected2(new Set())} className="ml-auto text-white/30 hover:text-white/60">✕</button>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-xl overflow-x-auto" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <table className="w-full text-sm">
          <thead className="text-[10px] text-white/40 uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" checked={selected2.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
              </th>
              {[["email","Email"],["joined_at","Cadastro"],["plan","Plano"],["subscription_created_at","Contratação"],["current_period_end","Próx. cobrança"]].map(([key, label]) => (
                <th key={key} className="px-4 py-3 text-left cursor-pointer hover:text-white/70 transition-colors" onClick={() => toggleSort(key as SortKey)}>
                  {label}{sortIcon(key as SortKey)}
                </th>
              ))}
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className={`transition-colors ${u.blocked ? "opacity-40" : "hover:bg-white/3"}`}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td className="px-3 py-3 text-center">
                  <input type="checkbox" checked={selected2.has(u.id)} onChange={() => toggleSelect(u.id)} />
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {u.email}
                  {u.role === "admin" && <span className="ml-2 text-[10px] rounded px-1 py-0.5" style={{ background: "rgba(233,30,140,0.2)", color: "#e91e8c" }}>admin</span>}
                  {u.blocked && <span className="ml-2 text-[10px] rounded px-1 py-0.5" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>bloqueado</span>}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{fmt(u.joined_at)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={u.plan === "premium" ? { background: "rgba(233,30,140,0.15)", color: "#e91e8c" } : { background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                    {u.plan === "premium" ? "Premium" : "Gratuito"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{fmt(u.subscription_created_at)}</td>
                <td className="px-4 py-3 text-white/40 text-xs">{fmt(u.current_period_end)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={u.blocked ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" } : { background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                    {u.blocked ? "Bloqueado" : "Ativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openUser(u)} className="text-[10px] text-[#e91e8c] hover:underline">Detalhes</button>
                    <button onClick={() => toggleBlock(u)} className={`text-[10px] hover:underline ${u.blocked ? "text-green-400" : "text-amber-400"}`}>
                      {u.blocked ? "Desbloquear" : "Bloquear"}
                    </button>
                    <button onClick={() => deleteUser(u)} className="text-[10px] text-red-400 hover:underline">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30 text-sm">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalhes */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
            style={{ background: "#1a1a2e", border: "1px solid rgba(233,30,140,0.3)", boxShadow: "0 0 40px rgba(233,30,140,0.15)" }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selected.email}</h2>
                <p className="text-xs text-white/40">Cadastro: {fmt(selected.joined_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {editMode ? (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Email</label>
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Plano</label>
                  <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <option value="free">Gratuito</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="rounded-lg px-3 py-1.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #e91e8c, #c2185b)" }}>
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="rounded-lg px-3 py-1.5 text-sm text-white/50 hover:text-white"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
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
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button onClick={() => setEditMode(true)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                    Editar dados
                  </button>
                  <button onClick={() => toggleBlock(selected)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={selected.blocked ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" } : { background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                    {selected.blocked ? "Desbloquear" : "Bloquear acesso"}
                  </button>
                  <button onClick={() => deleteUser(selected)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                    Excluir conta
                  </button>
                </div>
              </>
            )}

            <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Faturas</h3>
            {loadingInvoices && <p className="text-sm text-white/40">Carregando...</p>}
            {!loadingInvoices && invoices.length === 0 && <p className="text-sm text-white/30">Nenhuma fatura encontrada.</p>}
            {!loadingInvoices && invoices.length > 0 && (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const { label, cls } = invoiceStatusLabel(inv.status);
                  const clsMap: Record<string, { bg: string; color: string }> = {
                    "bg-green-100 text-green-700": { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
                    "bg-blue-100 text-blue-700":   { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
                    "bg-red-100 text-red-700":     { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
                    "bg-slate-100 text-slate-700": { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" },
                  };
                  const s = clsMap[cls] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
                  return (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div>
                        <p className="text-sm font-medium text-white">R$ {(inv.amount / 100).toFixed(2).replace(".", ",")}</p>
                        <p className="text-[10px] text-white/30">{fmtUnix(inv.date)}{inv.due ? ` · vence ${fmtUnix(inv.due)}` : ""}</p>
                      </div>
                      <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold" style={s}>{label}</span>
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
    slate: "#ffffff",
    amber: "#eab308",
    violet: "#e91e8c",
    red: "#ef4444",
  };
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-3xl font-black" style={{ color: colors[color] }}>{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-white mt-0.5">{value}</p>
    </div>
  );
}
