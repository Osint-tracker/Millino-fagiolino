// File: api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context, mode } = req.body; // 'mode' può essere 'chat' o 'spark'
  const apiKey = process.env.OPENROUTER_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Server Error: API Key missing' });

  let systemPrompt = "";

  if (mode === 'spark') {
    systemPrompt = `
      Sei un assistente di scrittura creativa per una tesi di filosofia.
      Il tuo compito è sbloccare la "pagina bianca".
      
      ISTRUZIONI:
      1. Leggi l'argomento richiesto.
      2. Fornisci 3 "Scintille" diverse per iniziare a scrivere:
         - Una domanda provocatoria.
         - Una frase di attacco "in media res" (accademica ma potente).
         - Un collegamento inaspettato tra due concetti.
      3. Sii breve e ispirante.
    `;
  } else {
    // Mode Standard (Chat)
    systemPrompt = `
      Sei un assistente di ricerca esperto in filosofia francese (Simondon/Deleuze).
      
      ACCESSO DATABASE BIBLIOGRAFICO:
      Hai accesso alla lista dei libri dell'utente.
      
      IMPORTANTE - NOTE UTENTE:
      Alcuni libri nel database hanno un campo "userNotes". QUESTE SONO LE NOTE SCRITTE DALL'UTENTE.
      Se l'utente ti chiede "cosa ho scritto su...", dai priorità assoluta a queste note.
      
      STILE:
      Rispondi in italiano accademico, tono professionale, empatico ("Millino Fagiolino style").
    `;
  }

  // Se il contesto è troppo grande, potremmo doverlo tagliare, ma per 85 libri va bene
  // Includiamo il context solo se c'è
  const fullSystemPrompt = context 
    ? `${systemPrompt}\n\nDATABASE UTENTE:\n${JSON.stringify(context)}`
    : systemPrompt;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://millino-fagiolino.vercel.app",
        "X-Title": "Millino Research"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3.2",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore OpenRouter');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
