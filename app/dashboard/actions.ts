"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, FREE_TASK_LIMIT } from "@/lib/subscription";

// ---- CREATE ----------------------------------------------------------
export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "O título é obrigatório" };

  const plan = await getUserPlan();
  if (plan === "free") {
    const { count } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["todo", "in_progress"]);
    if ((count ?? 0) >= FREE_TASK_LIMIT) {
      return { error: `Limite de ${FREE_TASK_LIMIT} tarefas pendentes atingido. Assine o Premium para continuar.` };
    }
  }

  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "todo"),
    priority: String(formData.get("priority") ?? "medium"),
    start_date: startDate || null,
    end_date: endDate || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

// ---- UPDATE ----------------------------------------------------------
export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "O título é obrigatório" };

  // O RLS já garante que só o dono atualiza; o filtro é defesa extra.
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "todo"),
      priority: String(formData.get("priority") ?? "medium"),
      start_date: startDate || null,
      end_date: endDate || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

// ---- UPDATE STATUS (atalho do dropdown rápido) -----------------------
export async function setStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

// ---- DELETE ----------------------------------------------------------
export async function deleteTask(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}
