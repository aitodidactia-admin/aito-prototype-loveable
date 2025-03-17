
// This function explicitly creates the feedback table on demand
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://bnecasmvbfefzqjjwnys.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjIyNDM5NiwiZXhwIjoyMDU3ODAwMzk2fQ.RB9OzU3kNhU0ROJo5QMaWJVOy83VMCQT9Tva1c1jz5I'
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log("Creating feedback table...")
    
    // First try to call the create_feedback_table() function
    const { error: rpcError } = await supabase.rpc('create_feedback_table')
    
    if (rpcError) {
      console.error('Error creating feedback table via RPC:', rpcError)
      
      // Fallback: try to use direct SQL if RPC fails
      console.log("Attempting to use direct SQL to create table...")
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.feedback (
          id uuid primary key default gen_random_uuid(),
          message text not null,
          from_website text,
          created_at timestamp with time zone default now()
        );
        
        -- Set up Row Level Security if table was just created
        ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
        
        -- Create policies if they don't exist
        DO $$
        BEGIN
          -- Check if the policy exists before creating it
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'feedback' 
            AND policyname = 'Allow full access for authenticated users'
          ) THEN
            CREATE POLICY "Allow full access for authenticated users" 
              ON public.feedback FOR ALL 
              USING (auth.role() = 'authenticated')
              WITH CHECK (auth.role() = 'authenticated');
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'feedback' 
            AND policyname = 'Allow anonymous inserts'
          ) THEN
            CREATE POLICY "Allow anonymous inserts" 
              ON public.feedback FOR INSERT 
              TO anon
              WITH CHECK (true);
          END IF;
        END
        $$;
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: createTableSQL })
      
      if (sqlError) {
        console.error('Error executing SQL:', sqlError)
        throw sqlError;
      }
    }
    
    // Now verify the table exists
    const { data, error: checkError } = await supabase
      .from('feedback')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('Table verification failed:', checkError)
      throw checkError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback table created and verified successfully",
        tableExists: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      },
    )
    
  } catch (error) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      },
    )
  }
})
