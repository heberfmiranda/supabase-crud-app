"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/dashboard/actions";

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
    <form ref={formRef} action={onSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-sm font-semibold text-slate-900">Nova tarefa</h2>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3 space-y-3">
        <input name="title" required placeholder="Título da tarefa"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
        <textarea name="description" rows={2} placeholder="Descrição (opcional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
        <div className="flex gap-3">
          <select name="status" defaultValue="todo"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
          <select name="priority" defaultValue="medium"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
            <option value="low">Prioridade baixa</option>
            <option value="medium">Prioridade média</option>
            <option value="high">Prioridade alta</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Data e hora de vencimento (opcional)</label>
          <input type="datetime-local" name="due_date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
        </div>
        <button type="submit" disabled={isPending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
          {isPending ? "Adicionando..." : "Adicionar tarefa"}
        </button>
      </div>
    </form>
  );
}
