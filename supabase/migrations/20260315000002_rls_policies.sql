-- =============================================================
-- Global Distribution AS — Row Level Security (RLS) Policies
-- Migrering: 20260315000002_rls_policies.sql
-- Idempotent: dropper og recreater policies
-- =============================================================

-- Enable RLS (trygt å kjøre flere ganger)
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.suppliers enable row level security;
alter table public.buyers enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory enable row level security;
alter table public.shipments enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;

-- -------------------------------------------------------
-- Helper: sjekk om innlogget bruker har en rolle
-- -------------------------------------------------------
create or replace function public.has_role(required_role text)
returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role::text = required_role
  );
$$ language sql security definer stable;

-- -------------------------------------------------------
-- Drop eksisterende policies (idempotent)
-- -------------------------------------------------------
do $$ declare pol record; begin
  for pol in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- -------------------------------------------------------
-- PROFILES
-- -------------------------------------------------------
create policy "profiles: own profile" on public.profiles
  for all using (id = auth.uid());

create policy "profiles: admin sees all" on public.profiles
  for select using (public.has_role('admin'));

-- -------------------------------------------------------
-- USER_ROLES
-- -------------------------------------------------------
create policy "user_roles: read own" on public.user_roles
  for select using (user_id = auth.uid());

create policy "user_roles: admin full" on public.user_roles
  for all using (public.has_role('admin'));

-- -------------------------------------------------------
-- SUPPLIERS
-- -------------------------------------------------------
create policy "suppliers: admin full" on public.suppliers
  for all using (public.has_role('admin'));

create policy "suppliers: own record" on public.suppliers
  for select using (user_id = auth.uid());

-- -------------------------------------------------------
-- BUYERS
-- -------------------------------------------------------
create policy "buyers: admin full" on public.buyers
  for all using (public.has_role('admin'));

create policy "buyers: own record" on public.buyers
  for select using (user_id = auth.uid());

-- -------------------------------------------------------
-- PRODUCTS
-- -------------------------------------------------------
create policy "products: admin full" on public.products
  for all using (public.has_role('admin'));

create policy "products: supplier sees own" on public.products
  for select using (
    public.has_role('supplier') and
    supplier_id in (
      select id from public.suppliers where user_id = auth.uid()
    )
  );

create policy "products: buyer reads active" on public.products
  for select using (
    public.has_role('buyer') and status = 'active'
  );

-- -------------------------------------------------------
-- QUOTES
-- -------------------------------------------------------
create policy "quotes: admin full" on public.quotes
  for all using (public.has_role('admin'));

create policy "quotes: buyer sees own" on public.quotes
  for select using (
    public.has_role('buyer') and
    buyer_id in (select id from public.buyers where user_id = auth.uid())
  );

create policy "quote_items: admin full" on public.quote_items
  for all using (public.has_role('admin'));

create policy "quote_items: buyer via quote" on public.quote_items
  for select using (
    public.has_role('buyer') and
    quote_id in (
      select q.id from public.quotes q
      join public.buyers b on b.id = q.buyer_id
      where b.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- ORDERS
-- -------------------------------------------------------
create policy "orders: admin full" on public.orders
  for all using (public.has_role('admin'));

create policy "orders: buyer sees own" on public.orders
  for select using (
    public.has_role('buyer') and
    buyer_id in (select id from public.buyers where user_id = auth.uid())
  );

create policy "orders: supplier reads relevant" on public.orders
  for select using (
    public.has_role('supplier') and
    id in (
      select distinct oi.order_id
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.suppliers s on s.id = p.supplier_id
      where s.user_id = auth.uid()
    )
  );

create policy "order_items: admin full" on public.order_items
  for all using (public.has_role('admin'));

create policy "order_items: supplier sees own products" on public.order_items
  for select using (
    public.has_role('supplier') and
    product_id in (
      select p.id from public.products p
      join public.suppliers s on s.id = p.supplier_id
      where s.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- INVENTORY
-- -------------------------------------------------------
create policy "inventory: admin full" on public.inventory
  for all using (public.has_role('admin'));

create policy "inventory: supplier sees own" on public.inventory
  for select using (
    public.has_role('supplier') and
    supplier_id in (select id from public.suppliers where user_id = auth.uid())
  );

-- -------------------------------------------------------
-- SHIPMENTS
-- -------------------------------------------------------
create policy "shipments: admin full" on public.shipments
  for all using (public.has_role('admin'));

-- -------------------------------------------------------
-- CONTRACTS
-- -------------------------------------------------------
create policy "contracts: admin full" on public.contracts
  for all using (public.has_role('admin'));

create policy "contracts: buyer reads own" on public.contracts
  for select using (
    public.has_role('buyer') and
    buyer_id in (select id from public.buyers where user_id = auth.uid())
  );

-- -------------------------------------------------------
-- PAYMENTS
-- -------------------------------------------------------
create policy "payments: admin full" on public.payments
  for all using (public.has_role('admin'));

-- -------------------------------------------------------
-- INVOICES
-- -------------------------------------------------------
create policy "invoices: admin full" on public.invoices
  for all using (public.has_role('admin'));

create policy "invoices: buyer reads own" on public.invoices
  for select using (
    public.has_role('buyer') and
    buyer_id in (select id from public.buyers where user_id = auth.uid())
  );
