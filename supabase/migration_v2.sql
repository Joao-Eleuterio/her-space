-- Executar UMA VEZ no SQL Editor do Supabase.
-- Preserva todos os dados da primeira versão.
do $$ begin
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='measurements' and column_name='measured_month') then
  alter table public.measurements rename column measured_month to measured_on;
 end if;
end $$;

alter table public.measurements drop constraint if exists measurements_user_id_measured_month_key;
alter table public.measurements alter column measured_on set default current_date;

create table if not exists public.art_ideas(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 label text not null,
 sort_order integer not null default 100,
 created_at timestamptz not null default now()
);
alter table public.art_ideas enable row level security;
drop policy if exists "Users manage own rows" on public.art_ideas;
create policy "Users manage own rows" on public.art_ideas for all
 using(auth.uid()=user_id) with check(auth.uid()=user_id);
grant select,insert,update,delete on public.art_ideas to authenticated;
