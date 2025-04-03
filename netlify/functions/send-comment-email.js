
// Netlify function to handle comment emails using Resend
exports.handler = async (event) => {
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
    const { comment, from_website } = JSON.parse(event.body);
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // Log environment info for debugging (will be visible in Netlify function logs)
    console.log('Environment variables available:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
    console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY);
    
    if (!RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Missing API key',
          envVarsAvailable: Object.keys(process.env).filter(key => !key.includes('SECRET')).length
        }),
      };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Admin <admin@aitodidactia.uk>",
        to: "admin@aitodidactia.uk",
        subject: "New Comment Submitted",
        html: `<strong>New comment from website:</strong><br/><br/>${comment}<br/><br/><em>Sent from: ${from_website}</em>`,
      }),
    });

    const data = await res.json();
    
    console.log("Resend API response:", data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data,
        message: 'Comment email sent successfully',
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
    };
  }
};
