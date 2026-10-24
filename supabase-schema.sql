-- Run this in the Supabase SQL editor

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date timestamptz not null,
  location text not null,
  end_time text,
  header_image_url text,
  amazon_wishlist_url text,
  tagline text,
  dress_code text,
  host_note text,
  accent_color text,
  created_at timestamptz default now()
);

create type rsvp_status as enum ('pending', 'attending', 'not_attending', 'maybe');

create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  phone text not null,
  invite_token uuid unique not null default gen_random_uuid(),
  rsvp_status rsvp_status not null default 'pending',
  invite_sent_at timestamptz,
  responded_at timestamptz,
  guest_count integer,
  rsvp_note text
);

-- Index for fast RSVP token lookups
create index guests_invite_token_idx on guests(invite_token);
create index guests_event_id_idx on guests(event_id);

-- Disable RLS (service role key bypasses it, but make it explicit)
alter table events disable row level security;
alter table guests disable row level security;

-- Migration: add columns for the new invite design (run on existing DBs)
alter table events add column if not exists end_time text;
alter table events add column if not exists tagline text;
alter table events add column if not exists dress_code text;
alter table events add column if not exists host_note text;
alter table events add column if not exists accent_color text;
alter table guests add column if not exists guest_count integer;
alter table guests add column if not exists rsvp_note text;
