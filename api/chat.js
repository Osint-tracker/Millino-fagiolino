// File: api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context, mode, model: requestedModel, systemOverride } = req.body;
  const openRouterKey = process.env.OPENROUTER_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (!openRouterKey && !openAIKey) return res.status(500).json({ error: 'Server Error: API Keys missing' });

  // Determine which API to use
  const isOpenAI = requestedModel && (requestedModel.startsWith('gpt-') || requestedModel.startsWith('o1-'));
  const apiUrl = isOpenAI
    ? "https://api.openai.com/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";
  const authKey = isOpenAI ? openAIKey : openRouterKey;

  if (!authKey) return res.status(400).json({ error: `Chiave non configurata per il modello ${requestedModel}` });

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
    systemPrompt = systemOverride || `
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

  const fullSystemPrompt = context
    ? `${systemPrompt}\n\nDATABASE UTENTE:\n${JSON.stringify(context)}`
    : systemPrompt;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authKey}`,
        "Content-Type": "application/json",
        ...(isOpenAI ? {} : {
          "HTTP-Referer": "https://millino-fagiolino.vercel.app",
          "X-Title": "Millino Research"
        })
      },
      body: JSON.stringify({
        model: requestedModel || "deepseek/deepseek-v3.2",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: message }
        ],
        temperature: requestedModel?.includes('gpt') ? 0.3 : 0.4
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore API');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
