create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','coach','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id),
  unique (org_id, id)
);

create or replace function public.is_org_member(p_org_id uuid, p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and (p_roles is null or m.role = any(p_roles))
  );
$$;

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  parent_program_id uuid,
  kind text not null default 'team' check (kind in ('sport','team')),
  sport text not null,
  name text not null,
  code text not null,
  level text,
  gender text,
  season_label text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, code),
  foreign key (org_id, parent_program_id) references public.programs(org_id, id) on delete cascade
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null,
  number integer,
  name text not null,
  position text,
  grade text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, program_id, name),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null,
  game_date date,
  opponent text not null,
  us_score integer check (us_score >= 0),
  them_score integer check (them_score >= 0),
  result text check (result in ('W','L','T')),
  tournament text,
  source text not null default 'manual' check (source in ('manual','upload')),
  raw_json jsonb,
  idempotency_key text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, idempotency_key),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null,
  player_id uuid,
  title text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, id),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade,
  foreign key (org_id, player_id) references public.players(org_id, id) on delete cascade
);

create table public.captures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null,
  player_id uuid,
  session_id uuid,
  capture_type text not null check (capture_type in ('note','stat','drill')),
  payload jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, id),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade,
  foreign key (org_id, player_id) references public.players(org_id, id) on delete cascade,
  foreign key (org_id, session_id) references public.sessions(org_id, id) on delete set null
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  capture_id uuid not null,
  body text not null,
  visibility text not null default 'staff' check (visibility in ('private','staff','parent')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, capture_id),
  foreign key (org_id, capture_id) references public.captures(org_id, id) on delete cascade
);

create table public.focus_plans (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null,
  player_id uuid,
  title text not null,
  week_start date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, id),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade,
  foreign key (org_id, player_id) references public.players(org_id, id) on delete cascade
);

create table public.focus_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  focus_plan_id uuid not null,
  body text not null,
  position integer not null default 0,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, id),
  foreign key (org_id, focus_plan_id) references public.focus_plans(org_id, id) on delete cascade
);

create table public.drill_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid not null,
  title text not null,
  category text,
  url text not null check (url ~ '^https://'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, id),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade
);

create table public.drill_link_players (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  drill_link_id uuid not null,
  player_id uuid not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, drill_link_id, player_id),
  foreign key (org_id, drill_link_id) references public.drill_links(org_id, id) on delete cascade,
  foreign key (org_id, player_id) references public.players(org_id, id) on delete cascade
);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id uuid,
  storage_key text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  status text not null default 'pending' check (status in ('pending','parsed','confirmed','error')),
  parsed_json jsonb,
  confirmed_game_id uuid,
  error text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, storage_key),
  unique (org_id, confirmed_game_id),
  foreign key (org_id, program_id) references public.programs(org_id, id) on delete cascade,
  foreign key (org_id, confirmed_game_id) references public.games(org_id, id) on delete set null
);

create table public.stat_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  game_id uuid not null,
  player_id uuid not null,
  pts integer not null default 0, fgm integer not null default 0, fga integer not null default 0,
  tpm integer not null default 0, tpa integer not null default 0,
  ftm integer not null default 0, fta integer not null default 0,
  oreb integer not null default 0, dreb integer not null default 0, reb integer not null default 0,
  ast integer not null default 0, stl integer not null default 0, blk integer not null default 0,
  tov integer not null default 0, pf integer not null default 0, min integer not null default 0,
  plus_minus integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, game_id, player_id),
  foreign key (org_id, game_id) references public.games(org_id, id) on delete cascade,
  foreign key (org_id, player_id) references public.players(org_id, id) on delete cascade
);

create index memberships_user_idx on public.memberships(user_id, status);
create index programs_org_idx on public.programs(org_id, parent_program_id, sort_order);
create index players_program_idx on public.players(org_id, program_id, active);
create index games_program_idx on public.games(org_id, program_id, game_date desc);
create index captures_player_idx on public.captures(org_id, player_id, captured_at desc);
create index uploads_status_idx on public.uploads(org_id, status, created_at desc);
create index stat_lines_player_idx on public.stat_lines(org_id, player_id);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

create policy organizations_read on public.organizations for select using (public.is_org_member(id));
create policy organizations_update on public.organizations for update using (public.is_org_member(id, array['owner','admin'])) with check (public.is_org_member(id, array['owner','admin']));
create policy memberships_read on public.memberships for select using (user_id = auth.uid() or public.is_org_member(org_id, array['owner','admin']));
create policy memberships_manage on public.memberships for all using (public.is_org_member(org_id, array['owner','admin'])) with check (public.is_org_member(org_id, array['owner','admin']));

do $$
declare table_name text;
begin
  foreach table_name in array array['programs','players','games','sessions','captures','notes','focus_plans','focus_items','drill_links','drill_link_players','uploads','stat_lines']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy tenant_read on public.%I for select using (public.is_org_member(org_id))', table_name);
    execute format('create policy tenant_insert on public.%I for insert with check (public.is_org_member(org_id, array[''owner'',''admin'',''coach'']))', table_name);
    execute format('create policy tenant_update on public.%I for update using (public.is_org_member(org_id, array[''owner'',''admin'',''coach''])) with check (public.is_org_member(org_id, array[''owner'',''admin'',''coach'']))', table_name);
    execute format('create policy tenant_delete on public.%I for delete using (public.is_org_member(org_id, array[''owner'',''admin'',''coach'']))', table_name);
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_org_member(uuid, text[]) to authenticated;
