-- Run this in Supabase SQL editor before using the new Stripe Connect flow.

alter table if exists public.restaurants
  add column if not exists stripe_account_id text,
  add column if not exists stripe_onboarding_complete boolean default false,
  add column if not exists stripe_charges_enabled boolean default false,
  add column if not exists stripe_payouts_enabled boolean default false;

alter table if exists public.orders
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists payment_status text;

create index if not exists restaurants_stripe_account_id_idx on public.restaurants (stripe_account_id);
create index if not exists orders_stripe_checkout_session_id_idx on public.orders (stripe_checkout_session_id);
