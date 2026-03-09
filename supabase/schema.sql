-- 乒乓球 H2H 项目 Supabase 表结构
-- 在 Supabase Dashboard → SQL Editor 中执行（仅建表/RLS/球员，不包含交手数据更新）

-- 球员表（8 人）
create table if not exists public.players (
  name_zh text primary key
);

-- 交手汇总表（按字典序 player1 < player2 存储）
create table if not exists public.h2h (
  player1 text not null,
  player2 text not null,
  player1_wins int not null default 0,
  player2_wins int not null default 0,
  player1_major_wins int not null default 0,
  player2_major_wins int not null default 0,
  recent_matches jsonb not null default '[]'::jsonb,
  primary key (player1, player2),
  check (player1 < player2)
);

-- 允许匿名只读（用于 Pages 前端）
alter table public.players enable row level security;
alter table public.h2h enable row level security;

drop policy if exists "Allow public read players" on public.players;
create policy "Allow public read players"
  on public.players for select
  using (true);

drop policy if exists "Allow public read h2h" on public.h2h;
create policy "Allow public read h2h"
  on public.h2h for select
  using (true);

-- 插入 8 名球员（交手数据由 seed 或 patch 脚本单独写入）
insert into public.players (name_zh) values
  ('马龙'), ('樊振东'), ('许昕'), ('王皓'), ('马琳'), ('王励勤'), ('张继科'), ('王楚钦')
on conflict (name_zh) do nothing;
