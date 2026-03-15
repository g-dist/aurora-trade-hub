# Supabase — Database dokumentasjon

_Oppdatert: 2026-03-16_

## Prosjekt

- **Project ID:** `orsjlztclkiqntxznnyo`
- **URL:** `https://orsjlztclkiqntxznnyo.supabase.co`
- **Plan:** Free

## Tabeller og relasjoner

```
auth.users (Supabase-styrt)
  └── profiles (1:1)
        └── user_roles (1:N)

suppliers (1:N) products (N:1)
products  → order_items → orders → buyers
orders    → shipments
orders    → payments
orders    → invoices
orders    → contracts
quotes    → quote_items → products
inventory → products, suppliers
```

## Tabellbeskrivelser

| Tabell | Nøkkelfelt |
|--------|-----------|
| `profiles` | `id` (= auth.users.id), `full_name`, `language` |
| `user_roles` | `user_id`, `role` (admin/supplier/buyer) |
| `suppliers` | `name`, `contact_name`, `payment_terms`, `tripletex_id` |
| `buyers` | `name`, `wechat_id`, `account_type`, `tripletex_id` |
| `products` | `sku`, `name`, `supplier_id`, `supplier_price_nok`, `our_price_usd`, `margin_pct`, `stock_status` |
| `quotes` | `quote_number`, `buyer_id`, `status`, `valid_until` |
| `quote_items` | `quote_id`, `product_id`, `quantity`, `unit_price_usd` |
| `orders` | `order_number`, `buyer_id`, `status`, `payment_status`, `balance_due_usd` |
| `order_items` | `order_id`, `product_id`, `quantity`, `size` |
| `inventory` | `product_id`, `stage`, `supplier_id`, `quantity`, `est_next_move` |
| `shipments` | `order_id`, `status`, `carrier`, `tracking_number` |
| `contracts` | `order_id`, `buyer_id`, `status`, `file_url` |
| `payments` | `order_id`, `payment_type`, `amount_usd`, `paid_date` |
| `invoices` | `order_id`, `buyer_id`, `status`, `amount_usd`, `due_date`, `file_url` |

## ENUM-typer

```sql
user_role:       admin | supplier | buyer
order_status:    draft | pending | confirmed | processing | shipped | delivered | cancelled
payment_status:  unpaid | deposit_paid | partial | paid | overdue | refunded
shipment_status: not_started | processing | in_transit | with_jessica | at_warehouse | dispatched | delivered
inventory_stage: at_supplier | at_warehouse | in_transit | with_jessica | delivered
quote_status:    draft | sent | accepted | declined | expired
contract_status: draft | sent | signed | expired | cancelled
invoice_status:  draft | sent | paid | overdue | cancelled
stock_status:    in_stock | low_stock | out_of_stock | on_order | pre_order
```

## RLS-tilgang

```
admin    → full tilgang til alt
supplier → egne produkter, orders (der egne produkter inngår), inventory
buyer    → aktive produkter, egne quotes/orders/invoices/contracts
```

## Kjøre migrasjoner

```bash
# Første gang (trenger access token fra dashboard)
export SUPABASE_ACCESS_TOKEN=...
supabase link --project-ref orsjlztclkiqntxznnyo
supabase db push

# Ny migrasjon
# Lag fil i supabase/migrations/YYYYMMDDHHMMSS_beskrivelse.sql
supabase db push

# Se diff
supabase db diff
```

## Tilkobling fra app

Supabase-klienten settes opp i `packages/shared/src/supabase.ts` og leses av begge apps via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` i `.env.local`.
