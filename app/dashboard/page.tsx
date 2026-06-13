import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, FREE_TASK_LIMIT } from "@/lib/subscription";
import { isAdmin } from "@/lib/admin";
import Sidebar from "@/components/Sidebar";
import TaskForm from "@/components/TaskForm";
import TaskItem from "@/components/TaskItem";
import PlanBanner from "@/components/PlanBanner";
import TasksPieChart from "@/components/TasksPieChart";
import type { Task } from "@/components/types";

export default async function DashboardPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [plan, admin] = await Promise.all([getUserPlan(), isAdmin()]);

  const { data: tasks } = await supabase
    .from("tasks").select("*").order("created_at", { ascending: false });

  const list = (tasks ?? []) as Task[];
  const total = list.length;
  const done = list.filter((t) => t.status === "done").length;
  const inProgress = list.filter((t) => t.status === "in_progress").length;
  const todo = list.filter((t) => t.status === "todo").length;
  const pendingCount = todo + inProgress;
  const canAddTask = plan === "premium" || pendingCount < FREE_TASK_LIMIT;

  return (
    <div className="flex min-h-screen" style={{ background: "#0d1117" }}>
      <Sidebar email={user?.email ?? ""} plan={plan} isAdmin={admin} activeItem="/dashboard" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div>
            <h1 className="text-lg font-bold text-white">Minhas Tarefas</h1>
            <p className="text-xs text-white/40">{user?.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              Sair
            </button>
          </form>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {/* Banner de plano */}
          <PlanBanner plan={plan} />

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: total, color: "#ffffff" },
              { label: "A fazer", value: todo, color: "#8a8ab0" },
              { label: "Em andamento", value: inProgress, color: "#e91e8c" },
              { label: "Concluídas", value: done, color: "#22c55e" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Layout principal: form + lista à esquerda, gráfico à direita */}
          <div className="mt-4 flex gap-4 items-start">
            <div className="flex-1 min-w-0 space-y-4">
              {/* Formulário */}
              {canAddTask ? (
                <TaskForm />
              ) : (
                <div className="rounded-xl p-4 text-sm text-center" style={{ background: "rgba(233,30,140,0.08)", border: "1px solid rgba(233,30,140,0.2)", color: "#e91e8c" }}>
                  Limite de {FREE_TASK_LIMIT} tarefas pendentes atingido. Assine o Premium para continuar.
                </div>
              )}

              {/* Lista */}
              <div className="space-y-2">
                {list.length === 0 ? (
                  <div className="rounded-xl p-10 text-center text-sm text-white/30"
                    style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
                    Nenhuma tarefa ainda. Crie a primeira acima!
                  </div>
                ) : (
                  list.map((task) => <TaskItem key={task.id} task={task} />)
                )}
              </div>
            </div>

            {/* Gráfico — apenas Premium, coluna lateral */}
            {plan === "premium" && (
              <div className="w-64 shrink-0">
                <TasksPieChart todo={todo} inProgress={inProgress} done={done} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
