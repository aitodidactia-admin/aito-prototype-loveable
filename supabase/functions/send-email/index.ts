
// Follow this setup guide to integrate the Deno runtime and use TypeScript:
// https://docs.supabase.com/guides/functions/deno

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
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
    
    // Only try to send email if Resend API key exists
    let emailSent = false
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'admin@aitodidactia.uk'
    
    if (RESEND_API_KEY && RESEND_API_KEY.trim() !== '') {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: 'admin@aitodidactia.uk', // Updated to use the new email
            subject: 'New Feedback from Aito user',
            html: `
              <h2>New Feedback from Aito user</h2>
              <p><strong>From:</strong> ${from_website}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            `,
          })
        });

        const resendData = await resendResponse.json();
        
        if (resendResponse.ok) {
          emailSent = true;
          console.log("Email sent successfully via Resend:", resendData);
        } else {
          console.error("Resend API error:", resendData);
        }
      } catch (emailError) {
        console.error("Error sending email via Resend:", emailError)
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
              ? "Message saved but email not sent (no API key configured)" 
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
