export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  // Log for debugging
  console.log('API Route called:', req.method);
  console.log('Body type:', typeof req.body);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'POST') {
    try {
      console.log('Forwarding to Make.com...');
      
      // Make sure we have a body
      if (!req.body) {
        return res.status(400).json({ error: 'No data received' });
      }
      
      // Forward to Make.com
      const makeResponse = await fetch('https://hook.eu2.make.com/n2qhklk2qaxq54ojjyp734jmpsxswmql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const responseText = await makeResponse.text();
      console.log('Make.com status:', makeResponse.status);
      console.log('Make.com response:', responseText);
      
      // Make.com usually returns "Accepted"
      if (makeResponse.ok || makeResponse.status === 200 || makeResponse.status === 202 || responseText.toLowerCase().includes('accepted')) {
        return res.status(200).json({ 
          success: true, 
          message: 'Successfully sent to Make.com',
          makeStatus: makeResponse.status
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: 'Make.com error',
          details: responseText,
          status: makeResponse.status
        });
      }
    } catch (error) {
      console.error('Error in API route:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed. Use POST.' });
}
