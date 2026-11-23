-- =============================================================================
--  AETHERIA — 004_merchant_admin_studio_storage_and_rls.sql
--  No-Code Merchant Studio (/admin): Public 'product-images' Supabase Storage
--  Bucket + Storage Policies + Live CRUD Policies on products, product_variants,
--  orders, and discount_codes.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
set public = true;

drop policy if exists "Storage: public read product-images" on storage.objects;
create policy "Storage: public read product-images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Storage: merchant upload product-images" on storage.objects;
create policy "Storage: merchant upload product-images" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Storage: merchant update product-images" on storage.objects;
create policy "Storage: merchant update product-images" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "Storage: merchant delete product-images" on storage.objects;
create policy "Storage: merchant delete product-images" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'product-images');

grant select, insert, update, delete on
  public.products,
  public.product_variants,
  public.discount_codes,
  public.orders,
  public.order_items
to anon, authenticated;

drop policy if exists "Merchant Studio: insert products" on public.products;
create policy "Merchant Studio: insert products" on public.products
  for insert to anon, authenticated
  with check (price_usd >= 0 and stock_count >= 0);

drop policy if exists "Merchant Studio: update products" on public.products;
create policy "Merchant Studio: update products" on public.products
  for update to anon, authenticated
  using (true)
  with check (price_usd >= 0 and stock_count >= 0);

drop policy if exists "Merchant Studio: delete products" on public.products;
create policy "Merchant Studio: delete products" on public.products
  for delete to anon, authenticated
  using (true);

drop policy if exists "Merchant Studio: insert variants" on public.product_variants;
create policy "Merchant Studio: insert variants" on public.product_variants
  for insert to anon, authenticated
  with check (stock_count >= 0);

drop policy if exists "Merchant Studio: update variants" on public.product_variants;
create policy "Merchant Studio: update variants" on public.product_variants
  for update to anon, authenticated
  using (true)
  with check (stock_count >= 0);

drop policy if exists "Merchant Studio: delete variants" on public.product_variants;
create policy "Merchant Studio: delete variants" on public.product_variants
  for delete to anon, authenticated
  using (true);

drop policy if exists "Merchant Studio: read all discount codes" on public.discount_codes;
create policy "Merchant Studio: read all discount codes" on public.discount_codes
  for select to anon, authenticated
  using (true);

drop policy if exists "Merchant Studio: insert discount codes" on public.discount_codes;
create policy "Merchant Studio: insert discount codes" on public.discount_codes
  for insert to anon, authenticated
  with check (discount_percent between 1 and 90 and min_order_usd >= 0);

drop policy if exists "Merchant Studio: update discount codes" on public.discount_codes;
create policy "Merchant Studio: update discount codes" on public.discount_codes
  for update to anon, authenticated
  using (true)
  with check (discount_percent between 1 and 90 and min_order_usd >= 0);

drop policy if exists "Merchant Studio: delete discount codes" on public.discount_codes;
create policy "Merchant Studio: delete discount codes" on public.discount_codes
  for delete to anon, authenticated
  using (true);
