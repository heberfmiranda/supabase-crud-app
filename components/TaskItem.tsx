"use client";

import { useState, useTransition } from "react";
import { deleteTask, setStatus, updateTask } from "@/app/dashboard/actions";
import { PRIORITY_LABELS, STATUS_LABELS, type Task } from "./types";

const priorityStyles: Record<string, { bg: string; color: string }> = {
  low:    { bg: "rgba(138,138,176,0.15)", color: "#8a8ab0" },
  medium: { bg: "rgba(234,179,8,0.15)",   color: "#eab308" },
  high:   { bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  todo:        { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" },
  in_progress: { bg: "rgba(74,134,200,0.15)",  color: "#4a86c8" },
  done:        { bg: "rgba(34,197,94,0.15)",   color: "#22c55e" },
};

const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" };
const inputCls = "w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const s = iso.replace("T", " ").slice(0, 16);
  const [date, time] = s.split(" ");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time}`;
}

function toLocalDatetimeValue(iso: string | null) {
  if (!iso) return "";
  return iso.replace(" ", "T").slice(0, 16);
}

function toGCalFormat(iso: string) {
  return iso.replace(" ", "T").slice(0, 16)
    .split("").filter((c) => c !== "-" && c !== ":").join("") + "00";
}

function googleCalendarUrl(title: string, description: string, start: string | null, end: string | null) {
  if (!start) return null;
  const startFmt = toGCalFormat(start);
  const endFmt = end ? toGCalFormat(end) : startFmt;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description || "",
    dates: startFmt + "/" + endFmt,
  });
  return "https://calendar.google.com/calendar/render?" + params.toString();
}

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
    startTransition(async () => { await deleteTask(task.id); });
  }

  function onQuickStatus(value: string) {
    startTransition(async () => { await setStatus(task.id, value); });
  }

  const startStr = fmtDate(task.start_date);
  const endStr = fmtDate(task.end_date);
  const gcalUrl = googleCalendarUrl(task.title, task.description, task.start_date, task.end_date);
  const overdue = task.end_date
    ? new Date(task.end_date.replace(" ", "T")) < new Date() && task.status !== "done"
    : false;

  const ss = statusStyles[task.status];
  const ps = priorityStyles[task.priority];

  if (editing) {
    return (
      <form action={onUpdate} className="rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(74,134,200,0.3)" }}>
        {error && <p className="mb-2 rounded-lg px-3 py-2 text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>{error}</p>}
        <input name="title" defaultValue={task.title} required className={inputCls} style={inputStyle} />
        <textarea name="description" defaultValue={task.description} rows={2} className={"mt-2 " + inputCls} style={inputStyle} />
        <div className="mt-2 flex gap-2">
          <select name="status" defaultValue={task.status} className={"flex-1 " + inputCls} style={inputStyle}>
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
          <select name="priority" defaultValue={task.priority} className={"flex-1 " + inputCls} style={inputStyle}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div className="mt-2 flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Início</label>
            <input type="datetime-local" name="start_date" defaultValue={toLocalDatetimeValue(task.start_date)} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Fim</label>
            <input type="datetime-local" name="end_date" defaultValue={toLocalDatetimeValue(task.end_date)} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={isPending}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #4a86c8, #2d6ca8)" }}>
            Salvar
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl p-4 transition-all hover:border-white/15"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-white ${task.status === "done" ? "line-through opacity-40" : ""}`}>
            {task.title}
          </h3>
          {task.description && <p className="mt-1 text-xs text-white/40">{task.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: ss.bg, color: ss.color }}>
              {STATUS_LABELS[task.status]}
            </span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: ps.bg, color: ps.color }}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            {startStr && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                ▶ {startStr}
              </span>
            )}
            {endStr && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: overdue ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)", color: overdue ? "#ef4444" : "rgba(255,255,255,0.5)" }}>
                {overdue ? "⚠ " : "⏹ "}{endStr}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <select value={task.status} onChange={(e) => onQuickStatus(e.target.value)} disabled={isPending}
            className="rounded-lg px-2 py-1 text-[10px] text-white outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluída</option>
          </select>
          {gcalUrl && (
            <a href={gcalUrl} target="_blank" rel="noreferrer"
              className="rounded-lg px-2 py-1 text-sm transition-colors hover:bg-white/10" title="Google Calendar"
              style={{ color: "#4285f4" }}>📅</a>
          )}
          <button onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Editar">✎</button>
          <button onClick={onDelete} disabled={isPending}
            className="rounded-lg px-2 py-1 text-sm text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Excluir">🗑</button>
        </div>
      </div>
    </div>
  );
}
