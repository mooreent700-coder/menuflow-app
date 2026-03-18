create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  slug text unique not null,
  name text not null,
  phone text,
  logo_url text,
  hero_url text,
  is_live boolean default false,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists restaurant_drafts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz default now()
);
