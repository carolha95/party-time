-- Seed data for testing the RSVP invite page
-- Run this in the Supabase SQL editor after creating tables

insert into events (id, name, date, end_time, location, tagline, dress_code, host_note, accent_color)
values (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'Party Animals Birthday Bash',
  '2026-11-07T15:00:00-06:00',
  '5:00 PM',
  'The Backyard Garden, 123 Oak Lane, Austin TX',
  'Two laps around the sun call for twice the fun',
  'Casual festive',
  'Parking available on Oak Lane. Kids welcome!',
  '#2C7A5E'
);

insert into guests (event_id, name, phone, invite_token)
values (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'Test Guest',
  '+15551234567',
  '11111111-2222-3333-4444-555555555555'
);
