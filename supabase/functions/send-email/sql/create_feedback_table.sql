
-- This SQL function creates the feedback table if it doesn't exist
create or replace function create_feedback_table()
returns void as $$
begin
  -- Check if the table already exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'feedback') then
    -- Create the feedback table
    create table public.feedback (
      id uuid primary key default gen_random_uuid(),
      message text not null,
      from_website text,
      created_at timestamp with time zone default now()
    );
    
    -- Set up Row Level Security
    alter table public.feedback enable row level security;
    
    -- Create policy for authenticated users (admins)
    create policy "Allow full access for authenticated users" 
      on public.feedback for all 
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
      
    -- Create policy to allow anonymous inserts
    create policy "Allow anonymous inserts" 
      on public.feedback for insert 
      to anon
      with check (true);
  end if;
end;
$$ language plpgsql security definer;

-- Grant usage to service_role (so it can be called from Edge Functions)
grant execute on function create_feedback_table() to service_role;
