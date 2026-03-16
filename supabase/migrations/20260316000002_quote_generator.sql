-- =============================================================
-- Global Distribution AS — Quote Generator Support
-- 20260316000002_quote_generator.sql
-- =============================================================

-- Add buyer_segment to buyers table
do $$ begin
  create type buyer_segment as enum ('new', 'active', 'established', 'vip');
exception when duplicate_object then null; end $$;

alter table public.buyers add column if not exists segment buyer_segment default 'new';
alter table public.buyers add column if not exists order_count integer default 0;

-- Extend quotes table for generator
alter table public.quotes add column if not exists buyer_name_override text;
alter table public.quotes add column if not exists buyer_company text;
alter table public.quotes add column if not exists buyer_country text;
alter table public.quotes add column if not exists buyer_segment text default 'new';
alter table public.quotes add column if not exists language text default 'en';
alter table public.quotes add column if not exists delivery_weeks integer default 6;
alter table public.quotes add column if not exists nok_usd_rate numeric(8,4) default 0.088;
alter table public.quotes add column if not exists margin_pct numeric(5,2);
alter table public.quotes add column if not exists exported_to_obsidian boolean default false;
alter table public.quotes add column if not exists obsidian_followup_date date;

-- Extend quote_items for cost tracking
alter table public.quote_items add column if not exists supplier_cost_nok numeric(12,2);
alter table public.quote_items add column if not exists margin_pct numeric(5,2);
alter table public.quote_items add column if not exists product_name_override text;

-- RLS: allow admin to insert/update quotes and quote_items
drop policy if exists "quotes: admin insert" on public.quotes;
create policy "quotes: admin insert" on public.quotes
  for insert with check (public.has_role('admin'));

drop policy if exists "quotes: admin update" on public.quotes;
create policy "quotes: admin update" on public.quotes
  for update using (public.has_role('admin'));

drop policy if exists "quote_items: admin insert" on public.quote_items;
create policy "quote_items: admin insert" on public.quote_items
  for insert with check (public.has_role('admin'));

-- Function to generate next quote number
create or replace function public.next_quote_number()
returns text as $$
declare
  year text := to_char(now(), 'YYYY');
  seq integer;
begin
  select count(*) + 1 into seq
  from public.quotes
  where quote_number like 'QUO-' || year || '-%';
  return 'QUO-' || year || '-' || lpad(seq::text, 3, '0');
end;
$$ language plpgsql security definer;
