export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "A fazer",
  in_progress: "Em andamento",
  done: "Concluída",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};
