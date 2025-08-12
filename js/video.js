// api/video.js - Video Generation Webhook Endpoint (Vercel Serverless Function)

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
      
      // Validate request
      const { video_specs, audio_specs } = req.body;
      
      if (!video_specs || !video_specs.prompt) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing video specifications or prompt' 
        });
      }
      
      // Add timestamp and request ID
      const requestData = {
        ...req.body,
        request_id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processed_at: new Date().toISOString()
      };
      
      // Forward to Make.com Video Webhook
      const makeResponse = await fetch('https://hook.eu2.make.com/cm8ms9d0nly28j27i7mprdh02owzmlb4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const responseText = await makeResponse.text();
      
      console.log('Make.com response:', responseText);
      
      // Check if Make.com accepted the request
      if (makeResponse.ok || responseText.toLowerCase().includes('accepted')) {
        return res.status(200).json({ 
          success: true, 
          message: 'Video generation started successfully',
          request_id: requestData.request_id,
          estimated_time: '30-60 seconds'
        });
      } else {
        console.error('Make.com error:', responseText);
        return res.status(500).json({ 
          success: false, 
          error: 'Video generation service error',
          details: responseText 
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
