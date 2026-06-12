# Supabase CRUD App

Web app completa em **Next.js 15 (App Router) + TypeScript + Tailwind**, com
**autenticação Supabase (email + senha)** e um **dashboard CRUD de tarefas**
(criar, listar, editar, mudar status e excluir), com **Row Level Security** —
cada usuário só enxerga as próprias tarefas.

## O que já vem pronto

- Login e cadastro com email/senha (Server Actions)
- Proteção de rotas via middleware (`/dashboard` exige login)
- Sessão persistida em cookies (`@supabase/ssr`)
- Confirmação de email (rota `/auth/callback`)
- CRUD completo de tarefas com prioridade e status
- RLS no banco garantindo isolamento por usuário
- UI responsiva com cards de estatísticas

---

## Passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Acesse https://supabase.com e crie um projeto (anote a senha do banco).
contato@qualiguard.com.br
_rJcYZwb+6vR+pS
2. No menu lateral, vá em **SQL Editor → New query**.
Proj1
$YrYivX/$E%W7ju
3. Cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
   Isso cria a tabela `tasks`, o trigger de `updated_at` e as policies de RLS.

### 3. Pegar as chaves da API

No painel do Supabase: **Project Settings → API**. Você vai precisar de:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`

- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
NEXT_PUBLIC_SUPABASE_URL=https://mhkdmvlqmfczkpokpzlw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__xp6GK0Wh6SQ8fleMLjw8Q_9NEI9qJi

### 4. Configurar variáveis de ambiente

Copie o exemplo e preencha com seus valores:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 5. (Opcional) Configurar confirmação de email

Por padrão o Supabase pede confirmação de email no cadastro.

- **Para testar rápido sem email:** Authentication → Providers → Email →
  desative *"Confirm email"*. Assim o cadastro já entra logado.
- **Para manter a confirmação:** em Authentication → URL Configuration,
  adicione `http://localhost:3000/auth/callback` em *Redirect URLs*.

### 6. Rodar

```bash
npm run dev
```

Abra http://localhost:3000 — você cai no login. Crie uma conta e use o dashboard.

---

## Estrutura

```
.
├── app/
│   ├── page.tsx              # redireciona pra /login ou /dashboard
│   ├── login/page.tsx        # login (Server Action)
│   ├── signup/page.tsx       # cadastro (Server Action)
│   ├── auth/
│   │   ├── callback/route.ts # confirma email -> sessão
│   │   └── signout/route.ts  # logout
│   └── dashboard/
│       ├── page.tsx          # dashboard (lista + stats)
│       └── actions.ts        # Server Actions do CRUD
├── components/
│   ├── TaskForm.tsx          # criar tarefa
│   ├── TaskItem.tsx          # editar / status / excluir
│   └── types.ts              # tipos compartilhados
├── lib/supabase/
│   ├── client.ts             # cliente browser
│   ├── server.ts             # cliente server
│   └── middleware.ts         # refresh de sessão + guarda de rotas
├── middleware.ts             # entrypoint do middleware
└── supabase/schema.sql       # tabela + RLS (rode no Supabase)
```

## Como estender

- **Nova tabela/CRUD:** duplique o padrão de `tasks` no `schema.sql` (com RLS!)
  e crie novas Server Actions em `actions.ts`.
- **Login social (Google/GitHub):** habilite o provider no Supabase e use
  `supabase.auth.signInWithOAuth(...)` apontando pra `/auth/callback`.
- **Deploy:** funciona direto na Vercel. Configure as mesmas variáveis de
  ambiente e adicione a URL de produção em *Redirect URLs* no Supabase.
