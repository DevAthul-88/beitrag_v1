-- Create the user_tokens table
create table if not exists user_tokens (
  user_id uuid references auth.users on delete cascade primary key,
  github_token text not null,
  github_username text,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table user_tokens enable row level security;

-- Policy: Users can read their own tokens
create policy "Users can read own tokens"
  on user_tokens for select
  using (auth.uid() = user_id);

-- Policy: Service role can insert/update tokens (for the callback)
create policy "Service role can manage tokens"
  on user_tokens for all
  using (true)
  with check (true);

-- Add index for faster lookups
create index if not exists user_tokens_user_id_idx on user_tokens(user_id);