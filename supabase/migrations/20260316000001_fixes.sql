-- =============================================================
-- Global Distribution AS — Launch Fixes
-- 20260316000001_fixes.sql
-- =============================================================

-- -------------------------------------------------------
-- 1. Storage: product-images bucket (public read)
-- -------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Policy: anyone can read product images
drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Policy: authenticated suppliers can upload
drop policy if exists "product-images: supplier upload" on storage.objects;
create policy "product-images: supplier upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

-- -------------------------------------------------------
-- 2. Products RLS: supplier INSERT + UPDATE
-- -------------------------------------------------------
drop policy if exists "products: supplier can insert own" on public.products;
create policy "products: supplier can insert own" on public.products
  for insert
  with check (
    public.has_role('supplier') and
    supplier_id in (
      select id from public.suppliers where user_id = auth.uid()
    )
  );

drop policy if exists "products: supplier can update own" on public.products;
create policy "products: supplier can update own" on public.products
  for update
  using (
    public.has_role('supplier') and
    supplier_id in (
      select id from public.suppliers where user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- 3. Inquiries table: ensure it exists with all needed columns
-- -------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  buyer_name text,
  company text,
  contact text,
  product_name text,
  quantity integer,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- Add columns if table already existed without them
alter table public.inquiries add column if not exists product_name text;
alter table public.inquiries add column if not exists quantity integer;
alter table public.inquiries add column if not exists status text default 'new';

-- Allow anyone (anon) to insert inquiries (public contact form)
alter table public.inquiries enable row level security;

drop policy if exists "inquiries: public insert" on public.inquiries;
create policy "inquiries: public insert" on public.inquiries
  for insert with check (true);

drop policy if exists "inquiries: admin full" on public.inquiries;
create policy "inquiries: admin full" on public.inquiries
  for all using (public.has_role('admin'));
