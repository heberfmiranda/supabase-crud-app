import { createClient } from "@/lib/supabase/server";
import { getUserPlan, FREE_TASK_LIMIT } from "@/lib/subscription";
import { isAdmin } from "@/lib/admin";
import TaskForm from "@/components/TaskForm";
import TaskItem from "@/components/TaskItem";
import PlanBanner from "@/components/PlanBanner";
import TasksPieChart from "@/components/TasksPieChart";
import type { Task } from "@/components/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [plan, admin] = await Promise.all([getUserPlan(), isAdmin()]);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (tasks ?? []) as Task[];
  const total = list.length;
  const done = list.filter((t) => t.status === "done").length;
  const inProgress = list.filter((t) => t.status === "in_progress").length;
  const todo = list.filter((t) => t.status === "todo").length;

  const pendingCount = todo + inProgress;
  const canAddTask = plan === "premium" || pendingCount < FREE_TASK_LIMIT;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minhas tarefas</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {admin && (
            <a href="/admin" className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700">
              Painel Admin
            </a>
          )}
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* Banner de plano */}
      <section className="mt-4">
        <PlanBanner plan={plan} />
      </section>

      {/* Estatísticas */}
      <section className="mt-4 grid grid-cols-4 gap-3">
        <Stat label="Total" value={total} />
        <Stat label="A fazer" value={todo} />
        <Stat label="Em andamento" value={inProgress} />
        <Stat label="Concluídas" value={done} />
      </section>

      {/* Gráfico — apenas Premium */}
      {plan === "premium" && (
        <section className="mt-4">
          <TasksPieChart todo={todo} inProgress={inProgress} done={done} />
        </section>
      )}

      {/* Formulário */}
      <section className="mt-6">
        {canAddTask ? (
          <TaskForm />
        ) : (
          <div className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-700 ring-1 ring-amber-200">
            Você atingiu o limite de {FREE_TASK_LIMIT} tarefas pendentes do plano gratuito.
            Assine o Premium para continuar adicionando tarefas.
          </div>
        )}
      </section>

      {/* Lista */}
      <section className="mt-6 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
            Nenhuma tarefa ainda. Crie a primeira acima! 👆
          </p>
        ) : (
          list.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
