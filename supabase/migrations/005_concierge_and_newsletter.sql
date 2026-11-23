-- =============================================================================
-- AETHERIA — Day 12 Migration: Live Concierge Inquiries & Newsletter Subscribers
-- =============================================================================

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  order_reference text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_inquiries_created_at
  on public.contact_inquiries(created_at desc);

create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers(email);

alter table public.contact_inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

grant select, insert, update on public.contact_inquiries to anon, authenticated;
grant select, insert, update on public.newsletter_subscribers to anon, authenticated;

drop policy if exists "Anyone can submit contact inquiry" on public.contact_inquiries;
create policy "Anyone can submit contact inquiry"
  on public.contact_inquiries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Concierge and admins can read contact inquiries" on public.contact_inquiries;
create policy "Concierge and admins can read contact inquiries"
  on public.contact_inquiries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Concierge and admins can read newsletter subscribers" on public.newsletter_subscribers;
create policy "Concierge and admins can read newsletter subscribers"
  on public.newsletter_subscribers
  for select
  to anon, authenticated
  using (true);
