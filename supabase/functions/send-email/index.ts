
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
    
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Save the feedback to the database
    try {
      // First check if the table exists, create it if it doesn't
      const { error: tableExistsError } = await supabase.from('feedback').select('id').limit(1)
      
      if (tableExistsError) {
        // Create the feedback table if it doesn't exist
        const { error: createTableError } = await supabase.rpc('create_feedback_table')
        
        if (createTableError) {
          console.error('Error creating feedback table:', createTableError)
        }
      }
      
      // Save the feedback entry
      const { error: insertError } = await supabase.from('feedback').insert({
        message: message,
        from_website: from_website,
        created_at: new Date().toISOString()
      })
      
      if (insertError) {
        console.error('Error saving feedback to database:', insertError)
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      // Continue with email sending even if database operation fails
    }
    
    // Create SMTP client
    const client = new SmtpClient()
    
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
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      },
    )
  }
})
