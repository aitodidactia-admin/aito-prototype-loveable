
// Netlify function to handle email sending and feedback storage
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight call successful' }),
    };
  }

  try {
    // Parse the incoming request body
    const { message, from_website } = JSON.parse(event.body);
    
    // Here you would normally add code to send an email via your preferred service
    // For example with Resend, SendGrid, etc.
    // Replace process.env.RESEND_API_KEY with your actual API key in Netlify environment settings
    
    // Log the received data
    console.log('Received feedback:', { message, from_website });
    
    // Simulate successful processing
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Feedback received successfully',
        emailSent: false, // Set to true when email sending is implemented
        databaseSaved: false // Set to true when database saving is implemented
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
