// /api/enhance-prompt.js

// Benötigt die OpenAI-Bibliothek (npm install openai)
import OpenAI from 'openai';

// Der OpenAI-Client wird hier sicher mit dem API-Schlüssel initialisiert,
// den Sie in den Vercel Environment Variables hinterlegt haben.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Diese Funktion wird von Vercel auf dem Server ausgeführt
export default async function handler(req, res) {
  // Nur POST-Anfragen sind erlaubt
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Den vom Frontend gesendeten Prompt aus dem Request-Body holen
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Anfrage an die OpenAI Chat Completions API senden
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          "role": "system",
          "content": "Du bist ein Experte für die Erstellung von Text-zu-Video-Prompts. Deine Aufgabe ist es, einen gegebenen Benutzer-Prompt zu nehmen und ihn filmischer, detaillierter und dynamischer zu machen. Ergänze Aspekte wie Kamerawinkel, Lichtstimmung, Texturen und spezifische Bewegungen. Antworte ausschließlich mit dem verbesserten Prompt, ohne weitere Erklärungen."
        },
        {
          "role": "user",
          "content": prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    // Den verbesserten Prompt aus der Antwort extrahieren
    const enhancedPrompt = response.choices[0].message.content.trim();
    
    // Den verbesserten Prompt als JSON an das Frontend zurücksenden
    res.status(200).json({ enhancedPrompt });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to enhance prompt' });
  }
}
