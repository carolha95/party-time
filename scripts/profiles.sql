-- Profiles table: extends Supabase auth.users with app-specific data
create type user_role as enum ('admin', 'host', 'guest');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role user_role not null default 'guest',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row-level security
alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update any profile's role
create policy "Admins can update profiles"
  on profiles for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
