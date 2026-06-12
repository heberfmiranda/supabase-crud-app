import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Página raiz: redireciona conforme estado de login.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");
  redirect("/login");
}
