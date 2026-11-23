-- =============================================================================
--  AETHERIA — 002_guest_checkout_orders_rls.sql
--  Enables Guest & Authenticated Concierge Checkout, Live Order Telemetry
--  Tracking (/order/[id]), and Live Status Progression Simulation.
-- =============================================================================

grant select, insert, update on public.orders to anon, authenticated;
grant select, insert on public.order_items to anon, authenticated;

drop policy if exists "Orders: public guest checkout insert" on public.orders;
create policy "Orders: public guest checkout insert" on public.orders
  for insert to anon, authenticated
  with check (
    total_usd >= 0
    and char_length(trim(order_number)) >= 5
    and char_length(trim(customer_email)) >= 3
    and char_length(trim(customer_name)) >= 2
  );

drop policy if exists "Orders: public order tracking read" on public.orders;
create policy "Orders: public order tracking read" on public.orders
  for select to anon, authenticated
  using (true);

drop policy if exists "Orders: public status telemetry simulator update" on public.orders;
create policy "Orders: public status telemetry simulator update" on public.orders
  for update to anon, authenticated
  using (true)
  with check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

drop policy if exists "Order items: public guest checkout insert" on public.order_items;
create policy "Order items: public guest checkout insert" on public.order_items
  for insert to anon, authenticated
  with check (quantity > 0 and unit_price_usd >= 0);

drop policy if exists "Order items: public order tracking read" on public.order_items;
create policy "Order items: public order tracking read" on public.order_items
  for select to anon, authenticated
  using (true);
