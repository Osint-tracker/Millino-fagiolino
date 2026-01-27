// File: api/chat.js
// Questo codice gira sui server di Vercel, non nel browser!

export default async function handler(req, res) {
  // 1. Controlla che sia una richiesta POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  // 2. Recupera la chiave dai segreti di Vercel
  const apiKey = process.env.OPENROUTER_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API Key missing' });
  }

  try {
    // 3. Chiama OpenRouter (DeepSeek)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://atlas-phil.vercel.app", // Cambia con il tuo dominio reale se vuoi
        "X-Title": "Atlas.phil Research Suite"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3.2", // DeepSeek V3 (o usa "deepseek/deepseek-r1" per la versione reasoning)
        messages: [
          {
            role: "system",
            content: "Sei un assistente di ricerca esperto in filosofia francese (Simondon, Deleuze, Guattari). Rispondi in italiano accademico, preciso e strutturato."
          },
          { role: "user", content: message }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Errore OpenRouter');
    }

    // 4. Restituisci al frontend solo la risposta pulita
    return res.status(200).json(data);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
