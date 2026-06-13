"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/dashboard/actions";

const inputCls = "w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-[#4a86c8]";
const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" };
const selectCls = "flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none";

export default function TaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createTask(formData);
      if (res?.error) setError(res.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Nova tarefa</h2>

      {error && (
        <p className="mb-3 rounded-lg px-3 py-2 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>
      )}

      <div className="space-y-3">
        <input name="title" required placeholder="Título da tarefa" className={inputCls} style={inputStyle} />
        <textarea name="description" rows={2} placeholder="Descrição (opcional)" className={inputCls} style={inputStyle} />
        <div className="flex gap-2">
          <select name="status" defaultValue="todo" className={selectCls} style={inputStyle}>
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
          <select name="priority" defaultValue="medium" className={selectCls} style={inputStyle}>
            <option value="low">Prioridade baixa</option>
            <option value="medium">Prioridade média</option>
            <option value="high">Prioridade alta</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Início</label>
            <input type="datetime-local" name="start_date" className={inputCls} style={inputStyle} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Fim</label>
            <input type="datetime-local" name="end_date" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <button type="submit" disabled={isPending}
          className="w-full rounded-lg py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #4a86c8, #2d6ca8)" }}>
          {isPending ? "Adicionando..." : "+ Adicionar tarefa"}
        </button>
      </div>
    </form>
  );
}
