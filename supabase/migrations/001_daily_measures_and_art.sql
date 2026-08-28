-- Migração: roleta configurável + registos diários no Gym girlie.
-- Correr UMA vez no SQL Editor do Supabase (é segura em bases já existentes).

-- 1) Roleta da arte configurável
create table if not exists public.art_ideas(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text not null,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);
alter table public.art_ideas enable row level security;
drop policy if exists "Users manage own rows" on public.art_ideas;
create policy "Users manage own rows" on public.art_ideas for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
grant select,insert,update,delete on public.art_ideas to authenticated;

-- 2) Gym girlie: passa de 1 linha/mês para vários registos diários (a app faz a média mensal)
alter table public.measurements add column if not exists measured_on date;
update public.measurements set measured_on = measured_month where measured_on is null;
alter table public.measurements alter column measured_on set not null;
alter table public.measurements alter column measured_on set default current_date;
alter table public.measurements drop constraint if exists measurements_user_id_measured_month_key;
alter table public.measurements alter column measured_month drop not null;
