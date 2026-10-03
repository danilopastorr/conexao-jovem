create table if not exists public.retreat_participants (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 answers jsonb not null,
 completed boolean not null default false,
 completed_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.retreat_participants enable row level security;
-- Não crie políticas públicas. A aplicação usa a service role somente no servidor.
