import { createClient } from "@/lib/supabase/server";
import TaskForm from "@/components/TaskForm";
import TaskItem from "@/components/TaskItem";
import type { Task } from "@/components/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (tasks ?? []) as Task[];
  const total = list.length;
  const done = list.filter((t) => t.status === "done").length;
  const inProgress = list.filter((t) => t.status === "in_progress").length;
  const todo = list.filter((t) => t.status === "todo").length;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minhas tarefas</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">
            Sair
          </button>
        </form>
      </header>

      {/* Estatísticas */}
      <section className="mt-6 grid grid-cols-4 gap-3">
        <Stat label="Total" value={total} />
        <Stat label="A fazer" value={todo} />
        <Stat label="Em andamento" value={inProgress} />
        <Stat label="Concluídas" value={done} />
      </section>

      {/* Formulário */}
      <section className="mt-6">
        <TaskForm />
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
