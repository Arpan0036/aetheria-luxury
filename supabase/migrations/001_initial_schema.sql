-- =============================================================================
--  AETHERIA — 001_initial_schema.sql
--  Catalog, commerce & profile schema with Row Level Security.
--  Idempotent: safe to re-run (CREATE IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  0. Private schema for helper functions (NOT exposed via the Data API)
-- -----------------------------------------------------------------------------
create schema if not exists private;

-- updated_at maintenance (security invoker, pinned search_path)
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
--  1. Tables
-- -----------------------------------------------------------------------------

create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  subtitle       text not null default '',
  description    text not null default '',
  image_url      text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.products (
  id                    uuid primary key default gen_random_uuid(),
  category_id           uuid not null references public.categories (id) on delete restrict,
  sku                   text not null unique,
  title                 text not null,
  slug                  text not null unique,
  tagline               text not null default '',
  description           text not null default '',
  price_usd             numeric(10,2) not null check (price_usd >= 0),
  compare_at_price_usd  numeric(10,2) check (compare_at_price_usd is null or compare_at_price_usd >= 0),
  rating                numeric(3,2) not null default 0 check (rating between 0 and 5),
  review_count          integer not null default 0 check (review_count >= 0),
  stock_count           integer not null default 0 check (stock_count >= 0),
  is_featured           boolean not null default false,
  is_bestseller         boolean not null default false,
  is_new_arrival        boolean not null default false,
  materials             text[] not null default '{}',
  dimensions            text not null default '',
  weight                text not null default '',
  warranty_info         text not null default '',
  specs                 jsonb not null default '{}'::jsonb,
  images                text[] not null default '{}',
  three_d_config        jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists public.product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products (id) on delete cascade,
  sku                 text not null unique,
  variant_name        text not null,
  color_hex           text not null check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  price_modifier_usd  numeric(10,2) not null default 0,
  stock_count         integer not null default 0 check (stock_count >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references public.products (id) on delete cascade,
  author_name        text not null,
  author_city        text not null default '',
  rating             integer not null check (rating between 1 and 5),
  title              text not null default '',
  comment            text not null default '',
  verified_purchase  boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.discount_codes (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique check (code = upper(code)),
  description       text not null default '',
  discount_percent  integer not null check (discount_percent between 1 and 90),
  min_order_usd     numeric(10,2) not null default 0 check (min_order_usd >= 0),
  is_active         boolean not null default true,
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.profiles (
  id                        uuid primary key references auth.users (id) on delete cascade,
  email                     text,
  full_name                 text,
  role                      text not null default 'customer' check (role in ('customer', 'admin')),
  default_shipping_address  jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  user_id            uuid references public.profiles (id) on delete set null,
  customer_email     text not null,
  customer_name      text not null,
  shipping_address   jsonb not null default '{}'::jsonb,
  subtotal_usd       numeric(10,2) not null check (subtotal_usd >= 0),
  discount_usd       numeric(10,2) not null default 0 check (discount_usd >= 0),
  shipping_usd       numeric(10,2) not null default 0 check (shipping_usd >= 0),
  total_usd          numeric(10,2) not null check (total_usd >= 0),
  currency           text not null default 'USD' check (currency in ('USD', 'GBP', 'EUR')),
  status             text not null default 'processing'
                       check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_intent_id  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      uuid not null references public.products (id) on delete restrict,
  variant_id      uuid references public.product_variants (id) on delete set null,
  product_title   text not null,
  variant_name    text,
  quantity        integer not null check (quantity > 0),
  unit_price_usd  numeric(10,2) not null check (unit_price_usd >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
--  2. updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'categories','products','product_variants','reviews',
    'discount_codes','profiles','orders','order_items'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
--  3. Indexes (unique constraints already index sku/slug/code/order_number)
-- -----------------------------------------------------------------------------
-- products(slug) is covered by the UNIQUE constraint index products_slug_key.
create index if not exists products_category_id_idx      on public.products (category_id);
create index if not exists products_is_featured_idx      on public.products (is_featured) where is_featured;
create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create index if not exists reviews_product_id_idx        on public.reviews (product_id);
create index if not exists orders_user_id_idx            on public.orders (user_id);
create index if not exists order_items_order_id_idx      on public.order_items (order_id);
create index if not exists order_items_product_id_idx    on public.order_items (product_id);
create index if not exists order_items_variant_id_idx    on public.order_items (variant_id);

-- -----------------------------------------------------------------------------
--  4. Auth helpers
-- -----------------------------------------------------------------------------

-- Admin check. SECURITY DEFINER so it can read profiles without recursing
-- through profiles' own RLS. Lives in the unexposed `private` schema and only
-- ever inspects the *calling* user's row.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Auto-create a profile row for every new auth user.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- -----------------------------------------------------------------------------
--  5. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_variants  enable row level security;
alter table public.reviews           enable row level security;
alter table public.discount_codes    enable row level security;
alter table public.profiles          enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;

-- ---- Data API privileges (RLS still decides which rows) ---------------------
grant select on public.categories, public.products, public.product_variants,
                public.reviews, public.discount_codes
  to anon, authenticated;

-- Admin writes are gated by RLS policies below.
grant insert, update, delete on public.categories, public.products,
                public.product_variants, public.reviews, public.discount_codes
  to authenticated;

grant select on public.profiles to authenticated;
-- Customers may only edit safe columns — `role` is never client-writable.
revoke update on public.profiles from authenticated;
grant update (full_name, default_shipping_address) on public.profiles to authenticated;

grant select, insert, update, delete on public.orders, public.order_items to authenticated;

-- ---- Public catalog read -----------------------------------------------------
drop policy if exists "Catalog: public read categories" on public.categories;
create policy "Catalog: public read categories" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "Catalog: public read products" on public.products;
create policy "Catalog: public read products" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "Catalog: public read variants" on public.product_variants;
create policy "Catalog: public read variants" on public.product_variants
  for select to anon, authenticated using (true);

drop policy if exists "Catalog: public read reviews" on public.reviews;
create policy "Catalog: public read reviews" on public.reviews
  for select to anon, authenticated using (true);

grant insert on public.reviews to anon, authenticated;
drop policy if exists "Reviews: public submit field report" on public.reviews;
create policy "Reviews: public submit field report" on public.reviews
  for insert to anon, authenticated
  with check (
    rating between 1 and 5
    and char_length(trim(author_name)) between 2 and 80
    and char_length(trim(title)) between 2 and 140
    and char_length(trim(comment)) between 5 and 2000
  );

drop policy if exists "Discounts: public read active" on public.discount_codes;
create policy "Discounts: public read active" on public.discount_codes
  for select to anon, authenticated
  using (is_active and (expires_at is null or expires_at > now()));

-- ---- Admin full CRUD (catalog + discounts) ----------------------------------
drop policy if exists "Admin: manage categories" on public.categories;
create policy "Admin: manage categories" on public.categories
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admin: manage products" on public.products;
create policy "Admin: manage products" on public.products
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admin: manage variants" on public.product_variants;
create policy "Admin: manage variants" on public.product_variants
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admin: manage reviews" on public.reviews;
create policy "Admin: manage reviews" on public.reviews
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admin: manage discount codes" on public.discount_codes;
create policy "Admin: manage discount codes" on public.discount_codes
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---- Profiles -----------------------------------------------------------------
drop policy if exists "Profiles: read own" on public.profiles;
create policy "Profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---- Orders -------------------------------------------------------------------
drop policy if exists "Orders: read own" on public.orders;
create policy "Orders: read own" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Orders: insert own" on public.orders;
create policy "Orders: insert own" on public.orders
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Admin: manage orders" on public.orders;
create policy "Admin: manage orders" on public.orders
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---- Order items --------------------------------------------------------------
drop policy if exists "Order items: read own" on public.order_items;
create policy "Order items: read own" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));

drop policy if exists "Order items: insert own" on public.order_items;
create policy "Order items: insert own" on public.order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));

drop policy if exists "Admin: manage order items" on public.order_items;
create policy "Admin: manage order items" on public.order_items
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
