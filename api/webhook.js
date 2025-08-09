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
      // Forward to Make.com
      const makeResponse = await fetch('https://hook.eu2.make.com/n2qhklk2qaxq54ojjyp734jmpsxswmql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const responseText = await makeResponse.text();
      
      if (makeResponse.ok || responseText.includes('Accepted')) {
        return res.status(200).json({ 
          success: true, 
          message: 'Data sent to Make.com successfully' 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: 'Make.com error',
          details: responseText 
        });
      }
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
