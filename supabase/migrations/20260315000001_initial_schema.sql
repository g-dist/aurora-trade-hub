-- =============================================================
-- Global Distribution AS — Initial Schema
-- Migrering: 20260315000001_initial_schema.sql
-- Idempotent: trygt å kjøre selv om tabeller finnes fra før
-- =============================================================

-- -------------------------------------------------------
-- Extensions
-- -------------------------------------------------------
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- ENUM types (safe: ignorerer hvis de finnes)
-- -------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'supplier', 'buyer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'deposit_paid', 'partial', 'paid', 'overdue', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shipment_status as enum ('not_started', 'processing', 'in_transit', 'with_jessica', 'at_warehouse', 'dispatched', 'delivered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_stage as enum ('at_supplier', 'at_warehouse', 'in_transit', 'with_jessica', 'delivered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contract_status as enum ('draft', 'sent', 'signed', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('active', 'inactive', 'discontinued', 'pre_order');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock', 'on_order', 'pre_order');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------
-- USERS & ROLES
-- -------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role user_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- -------------------------------------------------------
-- SUPPLIERS
-- -------------------------------------------------------
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  location text,
  country text default 'NO',
  payment_terms text default 'Net 30',
  notes text,
  active boolean default true,
  user_id uuid references public.profiles(id),
  tripletex_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- BUYERS
-- -------------------------------------------------------
create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  wechat_id text,
  location text,
  country text,
  account_type text,
  account_manager text,
  notes text,
  active boolean default true,
  user_id uuid references public.profiles(id),
  tripletex_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name text not null,
  brand text,
  category text,
  description text,
  supplier_id uuid references public.suppliers(id),
  supplier_price_nok numeric(12,2),
  our_price_usd numeric(12,2),
  margin_pct numeric(5,2),
  stock_quantity integer default 0,
  stock_status stock_status default 'out_of_stock',
  status product_status default 'active',
  image_url text,
  tripletex_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- QUOTES
-- -------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null,
  buyer_id uuid references public.buyers(id),
  status quote_status default 'draft',
  valid_until date,
  notes text,
  total_usd numeric(12,2),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id),
  description text,
  quantity integer not null,
  unit_price_usd numeric(12,2),
  total_usd numeric(12,2) generated always as (quantity * unit_price_usd) stored,
  created_at timestamptz default now()
);

-- -------------------------------------------------------
-- ORDERS
-- -------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  buyer_id uuid references public.buyers(id),
  quote_id uuid references public.quotes(id),
  order_type text default 'Normal',
  status order_status default 'pending',
  payment_status payment_status default 'unpaid',
  supplier_cost_nok numeric(12,2),
  sale_price_usd numeric(12,2),
  margin_pct numeric(5,2),
  deposit_pct numeric(5,2) default 0,
  deposit_paid_usd numeric(12,2) default 0,
  balance_due_usd numeric(12,2),
  notes text,
  tripletex_id text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  description text,
  quantity integer not null,
  unit_price_nok numeric(12,2),
  unit_price_usd numeric(12,2),
  size text,
  notes text,
  created_at timestamptz default now()
);

-- -------------------------------------------------------
-- INVENTORY
-- -------------------------------------------------------
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  order_item_id uuid references public.order_items(id),
  quantity integer not null,
  stage inventory_stage default 'at_supplier',
  supplier_id uuid references public.suppliers(id),
  location_notes text,
  date_entered date default current_date,
  est_next_move date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- SHIPMENTS
-- -------------------------------------------------------
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  shipment_number text unique,
  order_id uuid references public.orders(id),
  status shipment_status default 'not_started',
  carrier text,
  tracking_number text,
  shipped_date date,
  estimated_arrival date,
  actual_arrival date,
  origin_country text,
  destination_country text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- CONTRACTS
-- -------------------------------------------------------
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text unique not null,
  order_id uuid references public.orders(id),
  buyer_id uuid references public.buyers(id),
  supplier_id uuid references public.suppliers(id),
  status contract_status default 'draft',
  signed_date date,
  expiry_date date,
  file_url text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- PAYMENTS
-- -------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  payment_type text,
  amount_usd numeric(12,2) not null,
  amount_nok numeric(12,2),
  paid_date date,
  payment_method text,
  reference text,
  notes text,
  tripletex_id text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- -------------------------------------------------------
-- INVOICES
-- -------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  order_id uuid references public.orders(id),
  buyer_id uuid references public.buyers(id),
  status invoice_status default 'draft',
  amount_usd numeric(12,2),
  amount_nok numeric(12,2),
  issued_date date,
  due_date date,
  paid_date date,
  file_url text,
  tripletex_id text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- ALTER existing tables: legg til manglende kolonner
-- (trygt å kjøre igjen — ADD COLUMN IF NOT EXISTS)
-- -------------------------------------------------------

-- suppliers: hadde bare id, name, country, contact_email, created_at
alter table public.suppliers add column if not exists contact_name text;
alter table public.suppliers add column if not exists email text;
alter table public.suppliers add column if not exists phone text;
alter table public.suppliers add column if not exists location text;
alter table public.suppliers add column if not exists payment_terms text default 'Net 30';
alter table public.suppliers add column if not exists notes text;
alter table public.suppliers add column if not exists active boolean default true;
alter table public.suppliers add column if not exists user_id uuid references public.profiles(id);
alter table public.suppliers add column if not exists tripletex_id text;
alter table public.suppliers add column if not exists updated_at timestamptz default now();

-- products: hadde annen struktur (price_nok, price_cny, stock_s/m/l/xl/xxl)
-- Vi beholder eksisterende kolonner og legger til nye
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists supplier_price_nok numeric(12,2);
alter table public.products add column if not exists our_price_usd numeric(12,2);
alter table public.products add column if not exists margin_pct numeric(5,2);
alter table public.products add column if not exists stock_quantity integer default 0;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists tripletex_id text;
alter table public.products add column if not exists updated_at timestamptz default now();

-- quotes: manglet created_by
alter table public.quotes add column if not exists created_by uuid references public.profiles(id);

-- shipments: manglet updated_at
alter table public.shipments add column if not exists updated_at timestamptz default now();

-- inquiries: eksisterende tabell vi ikke rører (beholdes)

-- -------------------------------------------------------
-- UPDATED_AT trigger
-- -------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','suppliers','buyers','products',
    'quotes','orders','inventory','shipments',
    'contracts','invoices'
  ] loop
    if not exists (
      select 1 from pg_trigger
      where tgname = 'trg_' || t || '_updated_at'
    ) then
      execute format(
        'create trigger trg_%s_updated_at before update on public.%s
         for each row execute function public.handle_updated_at()',
        t, t
      );
    end if;
  end loop;
end;
$$;
