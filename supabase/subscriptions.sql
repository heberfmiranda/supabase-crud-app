-- =====================================================================
-- Tabela de assinaturas — rode no SQL Editor do Supabase
-- =====================================================================

create table if not exists public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id   text,
  stripe_subscription_id text,
  plan                 text not null default 'free' check (plan in ('free', 'premium')),
  status               text not null default 'active',
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "select own subscription" on public.subscriptions;
drop policy if exists "insert own subscription" on public.subscriptions;
drop policy if exists "update own subscription" on public.subscriptions;

create policy "select own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);
