
/**
 * SQUAD ENGINE v5.0 (REAL PRODUCTION)
 * The AI Agent Pipeline for Millino Fagiolino OS.
 * Handles the 5-step book processing using OpenRouter & Vercel API.
 */

class SquadEngine {
    constructor() {
        this.file = null;
        this.status = 'idle'; // idle, running, completed
        this.extractedText = "";
        this.steps = [
            { id: 'cartographer', name: 'The Cartographer', model: 'meta-llama/llama-4-maverick', task: 'Structure Mapping' },
            { id: 'ontologist', name: 'The Ontologist', model: 'deepseek/deepseek-v3.2', task: 'Concept Extraction' },
            { id: 'sniper', name: 'The Sniper', model: 'deepseek/deepseek-v3.2', task: 'Quote Extraction' },
            { id: 'weaver', name: 'The Weaver', model: 'deepseek/deepseek-v3.2', task: 'Relationship Mapping' },
            { id: 'archivist', name: 'The Archivist', model: 'gpt-4o-mini', task: 'Synthesis & JSON Repair' }
        ];
        this.mockData = {};
    }

    static init(file) {
        if (!file) return;
        window.squadEngine = new SquadEngine();
        window.squadEngine.start(file);
    }

    async start(file) {
        this.file = file;
        this.status = 'running';

        // Show Modal
        this.renderModal();
        document.getElementById('squad-modal').classList.remove('hidden');

        try {
            // STEP 0: INGESTION
            this.setIngestionStatus('Extracting Text...');
            this.extractedText = await this.extractFullText(file);
            this.setIngestionStatus(`Text Extracted: ${this.extractedText.length} chars (UNLIMITED)`);

            // STEP 1: CARTOGRAPHER (Structure)
            const structure = await this.runAgent('cartographer',
                `ROLE: You are THE CARTOGRAPHER. Your job is to map the structure of this text.
                 TASK: Analyze the entire book text provided. Extract the Table of Contents or infer the logical structure (Chapters/Sections).
                 OUTPUT: A clean JSON object.
                 FORMAT: { "chapters": ["1. Title", "2. Title", "3. Title"] }
                 CONSTRAINT: Do not summarize. Just list the structure.`,
                this.extractedText
            );

            // STEP 2: ONTOLOGIST (Definitions)
            const definitions = await this.runAgent('ontologist',
                `ROLE: You are THE ONTOLOGIST. Your job is to extract the philosophical DNA.
                 TASK: Identify the 5 most critical PHILOSOPHICAL TERMS defined or used by the author.
                 OUTPUT: JSON Array of objects.
                 FORMAT: [ { "term": "Concept Name", "def": "Definizione accurata in ITALIANO." } ]
                 CONSTRAINT: Definitions MUST be in ITALIAN. Term names can be original language if specific (e.g., 'Hyle').`,
                this.extractedText
            );

            // STEP 3: SNIPER (Quotes)
            const quotes = await this.runAgent('sniper',
                `ROLE: You are THE SNIPER. Your job is to find the "Kill Shots".
                  TASK: Extract exactly 3 VERBATIM quotes that summarize the core thesis of the text.
                  OUTPUT: JSON Array of strings.
                  FORMAT: [ "Quote 1", "Quote 2", "Quote 3" ]
                  CONSTRAINT: Trace exact quotes in original language (Italiano preferred if available in text).`,
                this.extractedText
            );

            // STEP 4: WEAVER (Connections)
            const connections = await this.runAgent('weaver',
                `ROLE: You are THE WEAVER. You see the invisible threads of history.
                 TASK: Identify related philosophers (referenced or implied) and thematic clusters.
                 OUTPUT: JSON Object.
                 FORMAT: { "related_authors": ["Name1", "Name2"], "thematic_clusters": ["Tema1 (IT)", "Tema2 (IT)"] }
                 CONSTRAINT: Output themes in ITALIAN.`,
                this.extractedText
            );

            // STEP 5: ARCHIVIST (Synthesis)
            const finalJSON = await this.runAgent('archivist',
                `ROLE: You are THE ARCHIVIST. You compile the final dossier.
                 TASK: Synthesize the analysis into a final JSON record for the Millino Fagiolino Database.
                 INPUT DATA:
                 - Structure: ${JSON.stringify(structure)}
                 - Definitions: ${JSON.stringify(definitions)}
                 - Quotes: ${JSON.stringify(quotes)}
                 - Connections: ${JSON.stringify(connections)}
                 
                 OUTPUT: A Valid JSON Object with keys: title, author, year, pub, desc, structure, definitions, quotes, connections.
                 IMPORTANT: 
                 - 'desc' MUST be a 2-3 sentence summary in ITALIAN. 
                 - Infer Author/Title/Year from context.`,
                ""
            );

            // FINISH
            this.complete(finalJSON);

        } catch (error) {
            console.error("Squad Engine Failure:", error);
            alert("Errore nella pipeline AI: " + error.message);
            document.getElementById('squad-modal').classList.add('hidden');
        }
    }

    async extractFullText(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        // Progress updater
        const totalPages = pdf.numPages;
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";

            // Optional: Update UI with page progress
            if (i % 5 === 0) this.setIngestionStatus(`Scanning page ${i}/${totalPages}...`);
        }
        return fullText;
    }

    async runAgent(stepId, systemPrompt, contextText) {
        this.setStepStatus(stepId, 'working');

        const agent = this.steps.find(s => s.id === stepId);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Analyze the text according to system instructions.",
                    // UNLIMITED INGESTION (Removed .slice)
                    // Warning: Vercel Function Payload limit is 4.5MB.
                    // If text > ~4M chars, this call will fail with 413 Payload Too Large.
                    // But User requested removal of limits.
                    systemOverride: systemPrompt + (contextText ? `\n\nTEXT TO ANALYZE:\n${contextText}` : ""),
                    model: agent.model
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const rawContent = data.choices[0].message.content;

            // Parse Logic
            let parsed = SquadEngine.safeJSONParse(rawContent);
            if (!parsed) {
                // Fallback: If parse fails, keep raw string in a wrapper object for display?
                // Or throw error? Archivist relies on objects.
                // Let's create a dummy object if parse completely fails to avoid crashing pipeline
                parsed = { error: "Parse Failed", raw: rawContent };
            }

            this.mockData[stepId] = parsed;
            this.renderOutput(stepId, parsed);
            this.setStepStatus(stepId, 'done');
            return parsed;

        } catch (e) {
            console.error(`Agent ${step.name} failed:`, e);
            this.setStepStatus(stepId, 'error');
            throw e;
        }
    }

    setIngestionStatus(msg) {
        const el = document.getElementById('ingestion-status');
        if (el) el.innerText = msg;
    }

    setStepStatus(id, status) {
        const card = document.getElementById(`agent-card-${id}`);
        const icon = document.getElementById(`agent-icon-${id}`);
        const statusText = document.getElementById(`agent-status-${id}`);

        if (!card) return;

        if (status === 'working') {
            card.classList.remove('opacity-50', 'grayscale');
            card.classList.add('border-rose-500', 'animate-pulse', 'bg-white');
            icon.innerHTML = '⚙️';
            icon.classList.add('animate-spin');
            statusText.innerText = 'WORKING...';
            statusText.classList.add('text-rose-500');
        } else if (status === 'done') {
            card.classList.remove('animate-pulse', 'border-rose-500');
            card.classList.add('border-green-500');
            icon.classList.remove('animate-spin');
            icon.innerHTML = '✅';
            statusText.innerText = 'DONE';
            statusText.classList.remove('text-rose-500');
            statusText.classList.add('text-green-600');
            const details = card.querySelector('details');
            if (details) details.classList.remove('pointer-events-none');
        } else if (status === 'error') {
            card.classList.add('border-red-500');
            statusText.innerText = 'ERROR';
            statusText.classList.add('text-red-500');
        }
    }

    renderOutput(id, data) {
        const outputBox = document.getElementById(`agent-output-${id}`);
        if (!outputBox) return;

        let html = '';
        if (id === 'cartographer' && data.chapters) {
            html = `<ul class="list-disc list-inside text-xs text-stone-600">${data.chapters.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (id === 'ontologist' && Array.isArray(data)) {
            html = data.map(d => `<div class="mb-2"><strong class="text-stone-800">${d.term}:</strong> <span class="text-stone-600">${d.def}</span></div>`).join('');
        } else if (id === 'sniper' && Array.isArray(data)) {
            html = data.map(q => `<blockquote class="border-l-2 border-rose-200 pl-2 italic text-stone-600 mb-2">"${q}"</blockquote>`).join('');
        } else if (id === 'weaver' && data.related_authors) {
            html = `<div class="flex gap-2 flex-wrap mb-2">${data.related_authors.map(a => `<span class="bg-stone-100 px-2 py-1 rounded text-stone-600">${a}</span>`).join('')}</div>`;
        } else {
            html = `<pre class="text-[10px] bg-stone-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>`;
        }
        outputBox.innerHTML = html;
    }

    renderModal() {
        // Idempotent render
        if (document.getElementById('squad-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'squad-modal';
        modal.className = "fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in";
        modal.innerHTML = `
            <div class="bg-stone-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 h-[80vh] flex flex-col">
                <div class="p-6 bg-white border-b border-stone-200 flex justify-between items-center shrink-0">
                    <div>
                        <h3 class="font-serif text-2xl font-bold text-stone-900">Squad Engine v5.0</h3>
                        <p id="ingestion-status" class="text-xs text-stone-500 uppercase tracking-widest mt-1">Ready to start...</p>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto p-6 space-y-4">
                    ${this.steps.map(step => `
                        <div id="agent-card-${step.id}" class="bg-white border border-stone-200 rounded-xl p-0 transition-all duration-300 opacity-50 grayscale relative overflow-hidden">
                            <details class="w-full group pointer-events-none">
                                <summary class="flex items-center gap-4 p-5 cursor-pointer list-none">
                                    <div id="agent-icon-${step.id}" class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-lg shadow-sm shrink-0">
                                        ⏳
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center mb-1">
                                            <h4 class="font-bold text-stone-900 text-sm uppercase tracking-wide">${step.name}</h4>
                                            <span class="text-[9px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">${step.model}</span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <p class="text-xs text-stone-500">${step.task}</p>
                                            <span id="agent-status-${step.id}" class="text-[9px] font-bold uppercase tracking-widest text-stone-300">PENDING</span>
                                        </div>
                                    </div>
                                </summary>
                                <div class="px-5 pb-5 pt-0 animate-fadeIn">
                                    <div class="w-full h-px bg-stone-100 mb-4"></div>
                                    <div id="agent-output-${step.id}" class="text-xs text-stone-600 max-h-40 overflow-y-auto"></div>
                                </div>
                            </details>
                        </div>
                    `).join('')}
                </div>

                <div class="p-4 bg-white border-t border-stone-200 shrink-0 flex justify-end">
                     <button onclick="window.location.reload()" class="text-xs text-stone-400 font-bold hover:text-stone-900 mr-auto">ANNULLA</button>
                    <div class="text-[10px] text-stone-400 text-right">
                        <div>SQUAD PROCESSING BY OPENROUTER</div>
                        <div class="font-mono">LIVE PRODUCTION MODE</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    complete(finalData) {
        document.getElementById('squad-modal').innerHTML += `
            <div class="absolute inset-x-0 bottom-0 p-6 bg-green-500 text-white text-center font-bold uppercase tracking-widest animate-bounce cursor-pointer shadow-lg z-50" onclick="window.receiveBookData(window.squadEngine.mockData.archivist); document.getElementById('squad-modal').classList.add('hidden');">
                Processo Completato! Clicca per Salvare
            </div>
        `;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    static safeJSONParse(str) {
        if (!str) return null;
        try { return JSON.parse(str); } catch (e) {
            let clean = str.replace(/```json\s*|```/g, '').trim().replace(/,(\s*[}\]])/g, '$1');
            try { return JSON.parse(clean); } catch (e2) { return null; }
        }
    }
}
