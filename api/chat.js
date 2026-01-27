// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Ora riceviamo anche 'context' (la bibliografia) dal frontend
  const { message, context } = req.body;
  const apiKey = process.env.OPENROUTER_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Server Error: API Key missing' });

  // 2. Creiamo un prompt di sistema potenziato
  const systemPrompt = `
    Sei un assistente di ricerca esperto in filosofia francese contemporanea.
    
    HAI ACCESSO AL SEGUENTE DATABASE BIBLIOGRAFICO DELL'UTENTE (formato JSON):
    ${JSON.stringify(context)}
    
    ISTRUZIONI:
    1. Usa queste fonti per rispondere. Se l'utente chiede "cosa ho su Simondon?", guarda il database.
    2. Tieni conto dello 'status' (todo, reading, done) per consigliare le priorità.
    3. Rispondi in italiano accademico, tono professionale ma incoraggiante.
    4. Sii conciso.
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://millino-fagiolino.vercel.app",
        "X-Title": "Millino Fagiolino Research"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore OpenRouter');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
