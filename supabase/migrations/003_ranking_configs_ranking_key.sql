alter table public.ranking_configs
  add column if not exists ranking_key text not null default 'most-booked';

create index if not exists idx_ranking_configs_key_language
  on public.ranking_configs(ranking_key, language_code);
