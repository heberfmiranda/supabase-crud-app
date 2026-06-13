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
      <div className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-3 text-center text-sm font-medium text-white">
        ✨ Plano Premium ativo — tarefas ilimitadas e gráficos liberados
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
      <div>
        <p className="text-sm font-medium text-amber-800">Plano Gratuito</p>
        <p className="text-xs text-amber-600">Limite de 5 tarefas pendentes · Sem acesso aos gráficos</p>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? "Aguarde..." : "Assinar Premium — R$ 9,90/mês"}
      </button>
    </div>
  );
}
