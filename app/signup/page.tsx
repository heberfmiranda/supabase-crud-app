import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signup(formData: FormData) {
  "use server";
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  if (data.user && !data.session) {
    redirect(`/signup?message=${encodeURIComponent("Conta criada! Verifique seu email para confirmar antes de entrar.")}`);
  }
  redirect("/dashboard");
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen relative" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      {/* Marca d'água — canto superior esquerdo */}
      <div className="absolute top-0 left-0 pointer-events-none overflow-hidden opacity-15" style={{ width: "55%", height: "100%" }}>
        <Image src="/marca-dagua.png" alt="" fill className="object-cover object-left-top" />
      </div>

      {/* Painel esquerdo — logo próximo ao form */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-end justify-center pr-10 relative">
        <Image
          src="/logotipo-qualiguard.png"
          alt="QualiGuard Tecnologia"
          width={260}
          height={90}
          className="object-contain"
        />
        <p className="text-white/50 text-sm italic mt-3 text-right">Abrindo suas portas para o futuro</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
            {/* Logo mobile */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Image src="/logo-qg.png" alt="QG" width={60} height={60} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Criar conta</h1>
            <p className="text-sm text-white/50 mb-6">Comece a usar o QualiGuard</p>

            {error && <p className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">{error}</p>}
            {message && <p className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm text-green-400">{message}</p>}

            <form action={signup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" name="email" required placeholder="voce@email.com"
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Senha</label>
                <input type="password" name="password" required minLength={6} placeholder="mínimo 6 caracteres"
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>
              <button type="submit"
                className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #4a86c8, #2d6ca8)" }}>
                Criar conta
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/40">
              Já tem conta?{" "}
              <Link href="/login" className="text-[#4a86c8] font-semibold hover:underline">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
