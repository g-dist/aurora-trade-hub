-- =============================================================
-- Global Distribution AS — Initial Schema
-- Migrering: 20260315000001_initial_schema.sql
-- =============================================================

-- -------------------------------------------------------
-- Extensions
-- -------------------------------------------------------
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- ENUM types
-- -------------------------------------------------------
create type user_role as enum ('admin', 'supplier', 'buyer');
create type order_status as enum ('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type payment_status as enum ('unpaid', 'deposit_paid', 'partial', 'paid', 'overdue', 'refunded');
create type shipment_status as enum ('not_started', 'processing', 'in_transit', 'with_jessica', 'at_warehouse', 'dispatched', 'delivered');
create type inventory_stage as enum ('at_supplier', 'at_warehouse', 'in_transit', 'with_jessica', 'delivered');
create type quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired');
create type contract_status as enum ('draft', 'sent', 'signed', 'expired', 'cancelled');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type product_status as enum ('active', 'inactive', 'discontinued', 'pre_order');
create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock', 'on_order', 'pre_order');

-- -------------------------------------------------------
-- USERS & ROLES
-- -------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role user_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- -------------------------------------------------------
-- SUPPLIERS
-- -------------------------------------------------------
create table public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  location text,
  country text default 'NO',
  payment_terms text default 'Net 30',
  notes text,
  active boolean default true,
  user_id uuid references public.profiles(id),   -- linked portal user
  tripletex_id text,                              -- ekstern ID for Tripletex
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- BUYERS
-- -------------------------------------------------------
create table public.buyers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  wechat_id text,
  location text,
  country text,
  account_type text,                              -- 'Large Buyer', 'Small Buyer', 'Drop-shipper'
  account_manager text,
  notes text,
  active boolean default true,
  user_id uuid references public.profiles(id),   -- linked portal user
  tripletex_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------
create table public.products (
  id uuid primary key default uuid_generate_v4(),
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
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
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

create table public.quote_items (
  id uuid primary key default uuid_generate_v4(),
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
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  buyer_id uuid references public.buyers(id),
  quote_id uuid references public.quotes(id),
  order_type text default 'Normal',              -- 'Normal', 'Pre-order', 'Drop-ship'
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

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
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
create table public.inventory (
  id uuid primary key default uuid_generate_v4(),
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
create table public.shipments (
  id uuid primary key default uuid_generate_v4(),
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
create table public.contracts (
  id uuid primary key default uuid_generate_v4(),
  contract_number text unique not null,
  order_id uuid references public.orders(id),
  buyer_id uuid references public.buyers(id),
  supplier_id uuid references public.suppliers(id),
  status contract_status default 'draft',
  signed_date date,
  expiry_date date,
  file_url text,                                  -- Supabase Storage
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- PAYMENTS
-- -------------------------------------------------------
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id),
  payment_type text,                              -- 'deposit', 'balance', 'refund'
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
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text unique not null,
  order_id uuid references public.orders(id),
  buyer_id uuid references public.buyers(id),
  status invoice_status default 'draft',
  amount_usd numeric(12,2),
  amount_nok numeric(12,2),
  issued_date date,
  due_date date,
  paid_date date,
  file_url text,                                  -- Supabase Storage
  tripletex_id text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -------------------------------------------------------
-- UPDATED_AT trigger (brukes på alle tabeller med updated_at)
-- -------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','suppliers','buyers','products',
    'quotes','orders','inventory','shipments',
    'contracts','invoices'
  ] loop
    execute format(
      'create trigger trg_%s_updated_at before update on public.%s
       for each row execute function public.handle_updated_at()',
      t, t
    );
  end loop;
end;
$$;
