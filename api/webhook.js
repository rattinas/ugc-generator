export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    try {
      console.log('Receiving data from frontend...');
      
      // Forward to Make.com
      const makeResponse = await fetch('https://hook.eu2.make.com/n2qhklk2qaxq54ojjyp734jmpsxswmql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const responseText = await makeResponse.text();
      console.log('Make.com response:', responseText);
      
      // Make.com returns "Accepted" as text
      if (makeResponse.ok || responseText.includes('Accepted')) {
        return res.status(200).json({ 
          success: true, 
          message: 'Data sent to Make.com successfully' 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: 'Make.com rejected the request',
          details: responseText 
        });
      }
    } catch (error) {
      console.error('Error forwarding to Make.com:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
