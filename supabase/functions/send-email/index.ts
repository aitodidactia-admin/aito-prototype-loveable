
// Follow this setup guide to integrate the Deno runtime and use TypeScript:
// https://docs.supabase.com/guides/functions/deno

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
      subject: `New message from ${from_website}`,
      content: `Message: ${message}`,
      html: `
        <h2>New message from your website</h2>
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
