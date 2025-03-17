
-- Function to execute arbitrary SQL (with proper security restrictions)
-- This allows us to create tables and other database objects from Edge Functions
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Using security definer so it runs with the permissions of the creator
AS $$
BEGIN
  -- Execute the provided SQL query
  EXECUTE sql_query;
END;
$$;

-- Grant usage to authenticated users only
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
