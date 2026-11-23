-- =============================================================================
--  AETHERIA — 003_collector_portal_profiles_rls.sql
--  Collector Auth Portal (/account), 1-Click VIP Collector Demo Profile Seed,
--  Default Shipping Address Sync & Live 1-Click Role Switcher (customer <-> admin).
-- =============================================================================

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  'f0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'julian.vance@aetheria.studio',
  '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M4.8l1S8t6v4B5t1v4B5t1v4B5t1',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Julian Vance"}'::jsonb,
  now(),
  now()
)
on conflict (id) do nothing;

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  default_shipping_address
)
values (
  'f0000000-0000-4000-8000-000000000001',
  'julian.vance@aetheria.studio',
  'Julian Vance',
  'customer',
  '{"street":"412 Mercer St","apartment":"Penthouse B","city":"New York","state":"NY","postal_code":"10013","country":"United States","phone":"+1 (212) 555-0194"}'::jsonb
)
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  default_shipping_address = coalesce(public.profiles.default_shipping_address, excluded.default_shipping_address);

update public.orders
set user_id = 'f0000000-0000-4000-8000-000000000001'
where lower(customer_email) = 'julian.vance@aetheria.studio' and user_id is null;

grant select, insert, update on public.profiles to anon, authenticated;

drop policy if exists "Profiles: collector portal read" on public.profiles;
create policy "Profiles: collector portal read" on public.profiles
  for select to anon, authenticated
  using (true);

drop policy if exists "Profiles: collector portal insert" on public.profiles;
create policy "Profiles: collector portal insert" on public.profiles
  for insert to anon, authenticated
  with check (role in ('customer', 'admin'));

drop policy if exists "Profiles: collector portal update" on public.profiles;
create policy "Profiles: collector portal update" on public.profiles
  for update to anon, authenticated
  using (true)
  with check (role in ('customer', 'admin'));
