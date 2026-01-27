# 🧶 Millino Fagiolino | Research OS v4.4
> *“L'individuo è un sistema metastabile.”*

![Version](https://img.shields.io/badge/version-4.4-rose.svg) ![Status](https://img.shields.io/badge/status-stable-success.svg) ![Focus](https://img.shields.io/badge/focus-Simondon%2FDeleuze-blue.svg)

**Millino Fagiolino** non è un semplice sito web. È un **Sistema Operativo di Ricerca** progettato specificamente per accompagnare la stesura di tesi complesse in filosofia o lo studio di materie, con un focus verticale su Gilbert Simondon, Gilles Deleuze e la filosofia della tecnologia.

Costruito per eliminare le distrazioni e favorire il "Deep Work", integra un database bibliografico curato, strumenti di tracciamento delle abitudini e **Jesse**, un assistente AI con personalità canina che funge da relatore empatico (e un po' esigente).

---

## ✨ Funzionalità Principali

### 🧠 Database Specializzato
Un catalogo curato manualmente di testi essenziali ("Primary Sources", "Comparative Studies", "Tech & Ecology") con:
- **Priorità di Lettura**: Essenziale, High, Medium, Low.
- **Stato Dinamico**: Todo, Reading, Done (con animazione confetti al completamento 🎉).
- **Tagging Semantico**: Collega concetti tra libri diversi per creare una "nuvola di concetti".

### 🐕 Jesse (AI Research Assistant)
Un chatbot integrato (potenziato da **DeepSeek V3.2** tramite OpenRouter) che conosce l'intero database bibliografico.
- **Context-Aware**: Sa quali libri hai letto e quali no.
- **Note-Aware**: Se gli chiedi "cosa ho scritto su...", cerca nelle TUE note personali.
- **Multi-Modalità**:
    - *Chat Standard*: Risposte accademiche ma empatiche.
    - *Socrajess*: Risponde solo con domande maieutiche.
    - *Relatore Severo*: Ti mette sotto torchio. 
    - *Bonus*: Se gli chiedi una foto, te la manda (pescando dalla sua galleria personale).

### 🎯 Roadmap & Strategia Tesi
- **Roadmap Predefinite**: Percorsi di lettura strutturati per argomento (es. "Genesi Tecnica").
- **Custom Strategy AI**: Chiedi a Jesse di generare una strategia su misura per il tuo indice.
- **Deadline Tracker**: Conto alla rovescia intelligente per la consegna della tesi.

### 🧘 Zen Mode & Produttività
- **Focus Timer**: Pomodoro timer integrato (25:00).
- **Ambienti Sonori**: Pioggia, Café, Camino (con controlli di volume indipendenti).
- **Word Tracker**: Grafico giornaliero delle parole scritte.

### 📝 Strumenti di Scrittura
- **Citation Generator**: Genera bibliografie istantanee in formato classico o BibTeX selezionando i testi letti.
- **Export**: Scarica la tua bibliografia in `.txt`.

---

## 🛠 Tech Stack

Un approccio "No-Build" elegante e leggero per la massima velocità di iterazione.

- **Frontend**: HTML5 Semantico + Vanilla JS (ES6+).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (iniettato via CDN per prototyping rapido).
- **Icons**: [Lucide Icons](https://lucide.dev/).
- **Charts**: [Chart.js](https://www.chartjs.org/) per le statistiche.
- **Markdown**: `marked.js` per il rendering delle risposte AI.
- **Backend (Serverless)**: Vercel Functions (Node.js) per l'API proxy sicura verso OpenRouter.
- **Persistence**: `localStorage` per salvare note, stati di lettura e progressi (Privacy First: i dati restano nel tuo browser).

---

## 🚀 Installazione e Uso

### Requisiti
- Un account [Vercel](https://vercel.com/) (per il deploy e le Serverless Functions).
- Una API Key di [OpenRouter](https://openrouter.ai/).

### Setup Locale
1. Clona la repository.
2. Crea un file `.env` nella root con la tua chiave:
   ```bash
   OPENROUTER_KEY=sk-or-v1-tua-chiave...
   ```
3. Installa le dipendenze per Vercel CLI (opzionale, se vuoi testare l'API localmente):
   ```bash
   npm i -g vercel
   vercel dev
   ```
4. Apri `http://localhost:3000`.

### Struttura File
- `index.html`: Il core dell'applicazione (Monolith). Contiene tutta la UI e la logica frontend.
- `js/database.js`: Il "cervello" statico. Contiene l'array JSON `MASTER_DB` con i libri pre-caricati.
- `api/chat.js`: L'endpoint serverless che gestisce le chiamate a DeepSeek e inietta il System Prompt.
- `jesse/`: Cartella contenente le foto del cane Jesse.

---

## 🤝 Contribuire
Se vuoi aggiungere libri al `MASTER_DB`, modifica direttamente `js/database.js`. Assicurati di seguire lo schema JSON esistente:
```json
{ 
  "id": "XX01", 
  "author": "Cognome, N.", 
  "year": "YYYY", 
  "title": "Titolo", 
  "pub": "Editore", 
  "cat": "Categoria", 
  "prio": "PRIORITY", 
  "desc": "Breve descrizione" 
}
```

---

> *"Non si individua mai da soli."* — G. Simondon (probabilmente, se avesse usato questo OS)
