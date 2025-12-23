-- Create schedules table
create table if not exists schedules (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  date timestamp with time zone not null,
  type text default 'study',
  created_at timestamp with time zone default now()
);

-- Create index
create index if not exists schedules_user_id_idx on schedules(user_id);
create index if not exists schedules_date_idx on schedules(date);

-- Disable RLS for now
alter table schedules disable row level security;
