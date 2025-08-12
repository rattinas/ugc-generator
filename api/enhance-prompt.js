// /api/enhance-prompt.js

// Benötigt die OpenAI-Bibliothek (sollte bereits installiert sein)
import OpenAI from 'openai';

// Der OpenAI-Client wird sicher mit dem API-Schlüssel aus den Vercel Environment Variables initialisiert.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Die ID Ihres spezifischen OpenAI Assistants
const ASSISTANT_ID = 'asst_VK5KsE789oyBJr1ZRM26AG8y';

// Hilfsfunktion, um kurz zu warten
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Diese Funktion wird von Vercel auf dem Server ausgeführt
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Ein Prompt wird benötigt.' });
  }

  try {
    // Schritt 1: Einen neuen "Thread" (Unterhaltung) für diese Anfrage erstellen
    const thread = await openai.beta.threads.create();

    // Schritt 2: Die Nachricht des Benutzers (den Prompt) zum Thread hinzufügen
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    // Schritt 3: Ihren spezifischen Assistant auf diesem Thread ausführen
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Schritt 4: Warten, bis der Assistant seine Arbeit beendet hat
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await sleep(1000); // 1 Sekunde warten
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      // Falls ein Fehler im Run auftritt
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        console.error('Run failed with status:', runStatus.status);
        return res.status(500).json({ error: `Assistant run failed with status: ${runStatus.status}` });
      }
    }

    // Schritt 5: Die Nachrichten aus dem Thread abrufen, um die Antwort des Assistants zu erhalten
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Die erste Nachricht ist normalerweise die Antwort des Assistants
    const assistantResponse = messages.data.find(msg => msg.role === 'assistant');

    if (assistantResponse && assistantResponse.content[0].type === 'text') {
      const enhancedPrompt = assistantResponse.content[0].text.value;
      // Den verbesserten Prompt als JSON an das Frontend zurücksenden
      res.status(200).json({ enhancedPrompt: enhancedPrompt });
    } else {
      throw new Error("Der Assistant hat keine gültige Text-Antwort geliefert.");
    }

  } catch (error) {
    console.error('Fehler bei der OpenAI-Anfrage:', error);
    res.status(500).json({ error: 'Die Verbesserung des Prompts ist fehlgeschlagen.' });
  }
}
