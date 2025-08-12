// api/video.js - Fixed Video Generation Webhook Endpoint

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    try {
      console.log('📹 Video generation request received');
      
      // Forward to Make.com Video Webhook
      const makeResponse = await fetch('https://hook.eu2.make.com/cm8ms9d0nly28j27i7mprdh02owzmlb4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const responseText = await makeResponse.text();
      console.log('Make.com response:', responseText);
      
      // Make.com returns "Accepted" as plain text
      if (makeResponse.ok || responseText.toLowerCase().includes('accepted')) {
        return res.status(200).json({ 
          success: true, 
          message: 'Video generation started successfully'
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: 'Video generation service error'
        });
      }
    } catch (error) {
      console.error('Video webhook error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
