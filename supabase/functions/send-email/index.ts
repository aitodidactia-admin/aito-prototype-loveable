
// Follow this setup guide to integrate the Deno runtime and use TypeScript:
// https://docs.supabase.com/guides/functions/deno

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message, from_website } = await req.json()
    
    // Hotmail SMTP settings
    const EMAIL_HOST = Deno.env.get('EMAIL_HOST') || 'smtp-mail.outlook.com'
    const EMAIL_USERNAME = Deno.env.get('EMAIL_USERNAME') || 'sarahdonoghue1@hotmail.com'
    const EMAIL_PASSWORD = Deno.env.get('EMAIL_PASSWORD') || ''
    const EMAIL_FROM = 'sarahdonoghue1@hotmail.com'
    
    // Initialize Supabase client with environment variables or fallback to config values
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://bnecasmvbfefzqjjwnys.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjIyNDM5NiwiZXhwIjoyMDU3ODAwMzk2fQ.RB9OzU3kNhU0ROJo5QMaWJVOy83VMCQT9Tva1c1jz5I'
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Ensure the feedback table exists
    // First try to call the create_feedback_table() function
    console.log("Ensuring feedback table exists...")
    try {
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
        }
      } else {
        console.log("Feedback table exists or was created successfully via RPC function")
      }
    } catch (tableError) {
      console.error('Error ensuring feedback table exists:', tableError)
    }
    
    // Save the feedback to the database
    console.log("Attempting to insert feedback...")
    let databaseSaved = false
    try {
      const { error: insertError } = await supabase.from('feedback').insert({
        message: message,
        from_website: from_website,
        created_at: new Date().toISOString()
      })
      
      if (insertError) {
        console.error('Error saving feedback to database:', insertError)
      } else {
        console.log("Feedback saved successfully to database")
        databaseSaved = true
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
    }
    
    // Create SMTP client
    console.log("Attempting to send email...")
    const client = new SmtpClient()
    
    // Only try to send email if password exists
    let emailSent = false
    if (EMAIL_PASSWORD && EMAIL_PASSWORD.trim() !== '') {
      try {
        await client.connectTLS({
          hostname: EMAIL_HOST,
          port: 587,
          username: EMAIL_USERNAME,
          password: EMAIL_PASSWORD,
        })
        
        // Send email
        await client.send({
          from: EMAIL_FROM,
          to: to,
          subject: `New Feedback from Aito user`,
          content: `Message: ${message}`,
          html: `
            <h2>New Feedback from Aito user</h2>
            <p><strong>From:</strong> ${from_website}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        })
        
        await client.close()
        emailSent = true
        console.log("Email sent successfully")
      } catch (emailError) {
        console.error("Error sending email:", emailError)
      }
    } else {
      console.log("Email password not set, skipping email send")
    }
    
    return new Response(
      JSON.stringify({ 
        success: databaseSaved, 
        databaseSaved: databaseSaved, 
        emailSent: emailSent,
        message: emailSent 
          ? "Message saved and email sent" 
          : (databaseSaved 
              ? "Message saved but email not sent (no password configured)" 
              : "Failed to save message")
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: databaseSaved ? 200 : 500
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
