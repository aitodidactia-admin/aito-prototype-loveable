
// Follow this setup guide to integrate the Deno runtime and use TypeScript:
// https://docs.supabase.com/guides/functions/deno

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Initialize the Supabase client for the initialization
const initSupabaseUrl = Deno.env.get('SUPABASE_URL')
const initSupabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const initSupabase = createClient(initSupabaseUrl, initSupabaseKey)

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message, from_website } = await req.json()
    
    // Email settings from environment variables
    const EMAIL_HOST = Deno.env.get('EMAIL_HOST') || 'smtp-mail.outlook.com'
    const EMAIL_USERNAME = Deno.env.get('EMAIL_USERNAME') || 'sarahdonoghue1@hotmail.com'
    const EMAIL_PASSWORD = Deno.env.get('EMAIL_PASSWORD') || ''
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'sarahdonoghue1@hotmail.com'
    
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Save the feedback to the database
    let databaseSaved = false
    try {
      const { error: insertError } = await supabase.from('feedback').insert({
        message: message,
        from_website: from_website,
      });
      
      if (insertError) {
        console.error('Error saving feedback to database:', insertError)
      } else {
        databaseSaved = true
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
    }
    
    // Create SMTP client
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
      } catch (emailError) {
        console.error("Error sending email:", emailError)
      }
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
