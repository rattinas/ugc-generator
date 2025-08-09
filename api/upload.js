import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Temporärer Speicher für Bilder (wird nach 60 Sekunden gelöscht)
const uploadedFiles = new Map();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Upload neues Bild
  if (req.method === 'POST') {
    try {
      const { image } = req.body;
      
      // Entferne data:image/jpeg;base64, prefix
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generiere unique filename
      const fileId = uuidv4();
      const fileName = `${fileId}.jpg`;
      
      // Speichere temporär im Memory (nicht filesystem bei Vercel)
      uploadedFiles.set(fileId, {
        buffer: buffer,
        mimeType: 'image/jpeg',
        uploadTime: Date.now()
      });
      
      // Lösche nach 60 Sekunden
      setTimeout(() => {
        uploadedFiles.delete(fileId);
        console.log(`Deleted image: ${fileId}`);
      }, 60000);
      
      // Gib Download-URL zurück
      const imageUrl = `https://${req.headers.host}/api/upload?id=${fileId}`;
      
      return res.status(200).json({ 
        success: true,
        imageUrl: imageUrl,
        expiresIn: 60 
      });
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Download Bild
  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (!id || !uploadedFiles.has(id)) {
      return res.status(404).json({ error: 'Image not found or expired' });
    }
    
    const file = uploadedFiles.get(id);
    
    // Setze richtige Headers für Bild
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=60');
    
    // Sende Bild
    return res.status(200).send(file.buffer);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
