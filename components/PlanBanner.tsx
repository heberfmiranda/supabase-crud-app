"use client";

import { useState } from "react";

export default function PlanBanner({ plan }: { plan: "free" | "premium" }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  if (plan === "premium") {
    return (
      <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, rgba(74,134,200,0.15), rgba(194,24,91,0.1))", border: "1px solid rgba(74,134,200,0.3)", color: "#4a86c8" }}>
        ✨ Plano Premium ativo — tarefas ilimitadas e gráficos liberados
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div>
        <p className="text-sm font-semibold text-white/70">Plano Gratuito</p>
        <p className="text-xs text-white/40">Limite de 5 tarefas pendentes · Sem acesso aos gráficos</p>
      </div>
      <button onClick={handleUpgrade} disabled={loading}
        className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shrink-0 ml-4"
        style={{ background: "linear-gradient(135deg, #4a86c8, #2d6ca8)" }}>
        {loading ? "Aguarde..." : "Assinar Premium — R$ 9,90/mês"}
      </button>
    </div>
  );
}
