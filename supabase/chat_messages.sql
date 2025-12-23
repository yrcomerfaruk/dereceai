-- Create chat_messages table
create table if not exists chat_messages (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  response text not null,
  created_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists chat_messages_user_id_idx on chat_messages(user_id);
create index if not exists chat_messages_created_at_idx on chat_messages(created_at desc);

-- Enable RLS
alter table chat_messages enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own messages" on chat_messages;
drop policy if exists "Users can insert own messages" on chat_messages;

-- Policy: Users can view own messages
create policy "Users can view own messages"
  on chat_messages for select
  using (auth.uid() = user_id);

-- Policy: Users can insert own messages
create policy "Users can insert own messages"
  on chat_messages for insert
  with check (auth.uid() = user_id);
