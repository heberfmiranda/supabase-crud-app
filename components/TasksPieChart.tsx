"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#64748b", "#3b82f6", "#22c55e"];

export default function TasksPieChart({
  todo,
  inProgress,
  done,
}: {
  todo: number;
  inProgress: number;
  done: number;
}) {
  const data = [
    { name: "A fazer", value: todo },
    { name: "Em andamento", value: inProgress },
    { name: "Concluídas", value: done },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="mb-2 text-xs font-semibold text-white/60 uppercase tracking-wider">Distribuição</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
