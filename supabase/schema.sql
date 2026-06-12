-- =====================================================================
-- Schema do banco de dados — rode no SQL Editor do Supabase
-- (Dashboard do Supabase -> SQL Editor -> New query -> cole e RUN)
-- =====================================================================

-- Tabela de tarefas (o "CRUD" do dashboard)
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) > 0),
  description text default '',
  status      text not null default 'todo'
              check (status in ('todo', 'in_progress', 'done')),
  priority    text not null default 'medium'
              check (priority in ('low', 'medium', 'high')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índice para acelerar a listagem por usuário
create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- Atualiza updated_at automaticamente em cada UPDATE
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- Row Level Security: cada usuário só enxerga e mexe nas SUAS tarefas
-- =====================================================================
alter table public.tasks enable row level security;

-- Limpa policies antigas (idempotente)
drop policy if exists "select own tasks"  on public.tasks;
drop policy if exists "insert own tasks"  on public.tasks;
drop policy if exists "update own tasks"  on public.tasks;
drop policy if exists "delete own tasks"  on public.tasks;

create policy "select own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
