"use client";

import { useState, useTransition } from "react";
import {
  deleteTask,
  setStatus,
  updateTask,
} from "@/app/dashboard/actions";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
} from "./types";

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const statusStyles: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function TaskItem({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onUpdate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateTask(task.id, formData);
      if (res?.error) setError(res.error);
      else setEditing(false);
    });
  }

  function onDelete() {
    if (!confirm("Excluir esta tarefa?")) return;
    startTransition(async () => {
      await deleteTask(task.id);
    });
  }

  function onQuickStatus(value: string) {
    startTransition(async () => {
      await setStatus(task.id, value);
    });
  }

  // ---- MODO EDIÇÃO ----
  if (editing) {
    return (
      <form
        action={onUpdate}
        className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        {error && (
          <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <input
          name="title"
          defaultValue={task.title}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <textarea
          name="description"
          defaultValue={task.description}
          rows={2}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <div className="mt-2 flex gap-2">
          <select
            name="status"
            defaultValue={task.status}
            className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
          <select
            name="priority"
            defaultValue={task.priority}
            className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  // ---- MODO VISUALIZAÇÃO ----
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`font-medium text-slate-900 ${
              task.status === "done" ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-slate-500">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}
            >
              {STATUS_LABELS[task.status]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <select
            value={task.status}
            onChange={(e) => onQuickStatus(e.target.value)}
            disabled={isPending}
            title="Mudar status"
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-900"
          >
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
            title="Editar"
          >
            ✎
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
            title="Excluir"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
