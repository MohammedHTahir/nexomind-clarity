-- Enable pgvector for semantic node merging
create extension if not exists vector;

-- Node types enum
do $$ begin
  create type public.mind_node_type as enum ('theme','emotion','person','distortion','trigger');
exception when duplicate_object then null; end $$;

create table if not exists public.mind_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type public.mind_node_type not null,
  label text not null,
  label_normalized text not null,
  frequency integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists mind_nodes_user_type_label_uniq
  on public.mind_nodes (user_id, type, label_normalized);
create index if not exists mind_nodes_user_freq_idx
  on public.mind_nodes (user_id, frequency desc);
create index if not exists mind_nodes_embedding_idx
  on public.mind_nodes using hnsw (embedding vector_cosine_ops);

alter table public.mind_nodes enable row level security;

create policy "mind_nodes_select_own" on public.mind_nodes
  for select using (auth.uid() = user_id);
create policy "mind_nodes_insert_own" on public.mind_nodes
  for insert with check (auth.uid() = user_id);
create policy "mind_nodes_update_own" on public.mind_nodes
  for update using (auth.uid() = user_id);
create policy "mind_nodes_delete_own" on public.mind_nodes
  for delete using (auth.uid() = user_id);

create table if not exists public.mind_edges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_id uuid not null references public.mind_nodes(id) on delete cascade,
  target_id uuid not null references public.mind_nodes(id) on delete cascade,
  weight integer not null default 1,
  last_co_occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (source_id <> target_id)
);

create unique index if not exists mind_edges_user_pair_uniq
  on public.mind_edges (user_id, least(source_id, target_id), greatest(source_id, target_id));
create index if not exists mind_edges_user_idx
  on public.mind_edges (user_id);

alter table public.mind_edges enable row level security;

create policy "mind_edges_select_own" on public.mind_edges
  for select using (auth.uid() = user_id);
create policy "mind_edges_insert_own" on public.mind_edges
  for insert with check (auth.uid() = user_id);
create policy "mind_edges_update_own" on public.mind_edges
  for update using (auth.uid() = user_id);
create policy "mind_edges_delete_own" on public.mind_edges
  for delete using (auth.uid() = user_id);

-- Link table: which entries fed which nodes (for "what built this node" panel)
create table if not exists public.mind_node_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  node_id uuid not null references public.mind_nodes(id) on delete cascade,
  journal_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists mind_node_entries_node_idx
  on public.mind_node_entries (node_id, created_at desc);
create unique index if not exists mind_node_entries_uniq
  on public.mind_node_entries (node_id, journal_id);

alter table public.mind_node_entries enable row level security;

create policy "mne_select_own" on public.mind_node_entries
  for select using (auth.uid() = user_id);
create policy "mne_insert_own" on public.mind_node_entries
  for insert with check (auth.uid() = user_id);
create policy "mne_delete_own" on public.mind_node_entries
  for delete using (auth.uid() = user_id);

-- updated_at trigger
create trigger mind_nodes_set_updated_at
  before update on public.mind_nodes
  for each row execute function public.set_updated_at();

-- Similarity match helper (used by update-mind-map edge function)
create or replace function public.match_mind_node(
  _user_id uuid,
  _type public.mind_node_type,
  _embedding vector(1536),
  _threshold float default 0.82
)
returns table (id uuid, similarity float)
language sql stable security definer set search_path = public
as $$
  select n.id, 1 - (n.embedding <=> _embedding) as similarity
  from public.mind_nodes n
  where n.user_id = _user_id
    and n.type = _type
    and n.embedding is not null
    and 1 - (n.embedding <=> _embedding) >= _threshold
  order by n.embedding <=> _embedding
  limit 1
$$;