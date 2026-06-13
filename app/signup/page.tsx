import Link from "next/link";
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
    <main className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5">
        <svg viewBox="0 0 400 400" className="w-96 h-96">
          {[50,90,130,170,190].map((r, i) => (
            <circle key={i} cx="200" cy="200" r={r} fill="none" stroke="#4a86c8" strokeWidth="2" strokeDasharray="6 4"/>
          ))}
          <line x1="200" y1="10" x2="200" y2="390" stroke="#4a86c8" strokeWidth="2"/>
          <line x1="200" y1="200" x2="320" y2="360" stroke="#4a86c8" strokeWidth="2"/>
        </svg>
      </div>

      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative">
        <div className="w-24 h-24 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(74,134,200,0.5)]">
            {[40,28,16].map((r, i) => (
              <circle key={i} cx="50" cy="42" r={r} fill="none" stroke="#4a86c8" strokeWidth="3"
                strokeDasharray={i === 0 ? "none" : "5 3"} opacity={1 - i * 0.2}/>
            ))}
            <line x1="50" y1="2" x2="50" y2="82" stroke="#4a86c8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="50" y1="42" x2="78" y2="76" stroke="#4a86c8" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black tracking-wide mb-1">
            <span className="text-white">QUALI</span><span className="text-[#8a8ab0]">GUARD</span>
          </div>
          <div className="text-[#4a86c8] font-semibold tracking-widest text-sm mb-6">TECNOLOGIA</div>
          <p className="text-white/50 text-sm italic">Abrindo suas portas para o futuro</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
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
