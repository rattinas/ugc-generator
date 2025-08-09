export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// In-Memory Storage (wird bei jedem Deploy geleert)
const images = new Map();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { image } = req.body;
      
      // Generate simple unique ID
      const imageId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Store image in memory
      images.set(imageId, {
        data: image,
        created: Date.now()
      });
      
      // Auto-delete after 60 seconds
      setTimeout(() => {
        images.delete(imageId);
        console.log('Deleted:', imageId);
      }, 60000);
      
      // Return download URL
      const imageUrl = `https://${req.headers.host}/api/upload?id=${imageId}`;
      
      return res.status(200).json({ 
        success: true,
        imageUrl: imageUrl
      });
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'GET') {
    const { id } = req.query;
    
    const imageData = images.get(id);
    if (!imageData) {
      return res.status(404).send('Image expired or not found');
    }
    
    // Convert base64 to buffer
    const base64Data = imageData.data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Send as image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).send(buffer);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
