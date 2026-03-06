-- Optional bootstrap schema for local/dev environments.
-- If your caption/rating app already owns these tables, skip running this.

create table if not exists profiles (
  id uuid primary key,
  email text,
  is_superadmin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists captions (
  id uuid primary key default gen_random_uuid(),
  image_id uuid references images(id) on delete cascade,
  text text,
  created_at timestamptz not null default now()
);
