/**
 * SQUAD ENGINE v5.0 (ACTIVE INTELLIGENCE)
 * The AI Agent Pipeline for Millino Fagiolino OS.
 * Handles the 5-step book processing using OpenRouter & Vercel API.
 */

class SquadEngine {
    constructor() {
        this.file = null;
        this.status = 'idle'; // idle, running, completed
        this.extractedText = "";
        this.steps = [
            { id: 'architect', name: 'The Architect', model: 'meta-llama/llama-3.2-90b-vision-instruct', task: 'Mermaid Structure' },
            { id: 'relationist', name: 'The Relationist', model: 'deepseek/deepseek-chat', task: 'Concept Mapping' },
            { id: 'extractor', name: 'The Extractor', model: 'deepseek/deepseek-chat', task: 'Atomic Notes' },
            { id: 'strategist', name: 'The Strategist', model: 'deepseek/deepseek-chat', task: 'Argument Mining' },
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

            // STEP 1: ARCHITECT (Mermaid Structure)
            await this.runAgent('architect',
                `ROLE: You are THE ARCHITECT. You visualize knowledge structures.
                 TASK: Generate a valid Mermaid.js flowchart code representing the book's logical structure.
                 OUTPUT: ONLY the Mermaid code inside a code block.
                 FORMAT: graph TD; A[Title] --> B[Chapter 1]; ...
                 CONSTRAINT: Keep it high-level (max 15 nodes). No direction instructions outside the graph.`,
                this.extractedText
            );

            // STEP 2: RELATIONIST (Concept Map)
            await this.runAgent('relationist',
                `ROLE: You are THE RELATIONIST. Your job is to extract conceptual relationships.
                 TASK: Identify 5-7 key concepts and their relationships.
                 OUTPUT: JSON Array.
                 FORMAT: [ { "source": "Concept A", "relation": "refutes/supports/implies", "target": "Concept B" } ]
                 CONSTRAINT: Use Italian for concepts/relations.`,
                this.extractedText
            );

            // STEP 3: EXTRACTOR (Atomic Notes)
            await this.runAgent('extractor',
                `ROLE: You are THE EXTRACTOR. You mine for golden nuggets.
                 TASK: Extract 3 "Atomic Notes" that are self-contained and citable.
                 OUTPUT: JSON Array.
                 FORMAT: [ { "quote": "Verbatim Quote...", "paraphrase": "Rephrased insight...", "tag": "#Keyword" } ]
                 CONSTRAINT: Quotes in original language. Paraphrase in Italian.`,
                this.extractedText
            );

            // STEP 4: STRATEGIST (Arguments)
            await this.runAgent('strategist',
                `ROLE: You are THE STRATEGIST. You find arguments for the thesis.
                 TASK: Suggest 3 ways to use this text to support strict academic arguments.
                 OUTPUT: JSON Array of strings.
                 FORMAT: [ "Use this to argue that...", "Contrast this with..." ]
                 CONSTRAINT: Italian language. High academic tone.`,
                this.extractedText
            );

            // STEP 5: ARCHIVIST (Synthesis)
            const finalJSON = await this.runAgent('archivist',
                `ROLE: You are THE ARCHIVIST. You compile the final dossier.
                 TASK: Synthesize the analysis into a final JSON record for the Millino Fagiolino Database.
                 INPUT DATA:
                 - Architect: ${JSON.stringify(this.mockData.architect)}
                 - Relationist: ${JSON.stringify(this.mockData.relationist)}
                 - Extractor: ${JSON.stringify(this.mockData.extractor)}
                 - Strategist: ${JSON.stringify(this.mockData.strategist)}
                 
                 OUTPUT: A Valid JSON Object with keys: title, author, year, pub, desc, structure, definitions, quotes, connections.
                 IMPORTANT: 
                 - 'desc' MUST be a 2-3 sentence summary in ITALIAN. 
                 - Map 'Architect' mermaid code to 'structure.mermaid' field.
                 - Map 'Relationist' to 'connections'.
                 - Map 'Extractor' to 'quotes' (use paraphrase as text).
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
        const totalPages = pdf.numPages;
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";
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
                    message: "Analyze the text.",
                    systemOverride: systemPrompt + (contextText ? `\n\nTEXT TO ANALYZE:\n${contextText}` : ""),
                    model: agent.model
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const rawContent = data.choices[0].message.content;

            // Parse Logic
            let parsed = SquadEngine.safeJSONParse(rawContent);

            // Special handling for Architect (Code Block)
            if (stepId === 'architect') {
                const match = rawContent.match(/```mermaid([\s\S]*?)```/);
                parsed = match ? match[1].trim() : rawContent;
            } else if (!parsed) {
                parsed = { error: "Parse Failed", raw: rawContent };
            }

            this.mockData[stepId] = parsed;
            this.renderOutput(stepId, parsed);
            this.setStepStatus(stepId, 'done');
            return parsed;

        } catch (e) {
            console.error(`Agent ${agent.name} failed:`, e);
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
            // Auto open
            details.open = true;
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
        if (id === 'architect') {
            // Visualize Mermaid
            html = `<div class="mermaid">${typeof data === 'string' ? data : 'graph TD; Error;'}</div>`;
            // Trigger Mermaid Render (need a slight delay or explicit call)
            setTimeout(() => { try { mermaid.init(undefined, outputBox.querySelectorAll('.mermaid')); } catch (e) { } }, 500);

        } else if (id === 'relationist' && Array.isArray(data)) {
            html = data.map(d => `<div class="flex items-center gap-2 text-xs mb-1"><span class="font-bold">${d.source}</span> <span class="bg-stone-100 px-1 text-[10px] text-stone-500 rounded">${d.relation}</span> <span class="font-bold">${d.target}</span></div>`).join('');

        } else if (id === 'extractor' && Array.isArray(data)) {
            html = data.map(q => `<div class="mb-3 border-l-2 border-rose-200 pl-2"><div class="italic text-stone-600 text-[11px] mb-1">"${q.quote}"</div><div class="text-xs font-medium text-stone-900">${q.paraphrase}</div><span class="text-[9px] text-rose-400 bg-rose-50 px-1 rounded">${q.tag}</span></div>`).join('');

        } else if (id === 'strategist' && Array.isArray(data)) {
            html = `<ul class="list-disc list-inside text-xs text-stone-600 space-y-1">${data.map(s => `<li>${s}</li>`).join('')}</ul>`;

        } else {
            html = `<pre class="text-[10px] bg-stone-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>`;
        }
        outputBox.innerHTML = html;
    }

    renderModal() {
        if (document.getElementById('squad-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'squad-modal';
        modal.className = "fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in";
        modal.innerHTML = `
            <div class="bg-stone-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 h-[80vh] flex flex-col">
                <div class="p-6 bg-white border-b border-stone-200 flex justify-between items-center shrink-0">
                    <div>
                        <h3 class="font-serif text-2xl font-bold text-stone-900">Active Intelligence Squad</h3>
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
                        <div>SQUAD V5.0 POWERED BY OPENROUTER</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    complete(finalData) {
        document.getElementById('squad-modal').innerHTML += `
            <div class="absolute inset-x-0 bottom-0 p-6 bg-green-500 text-white text-center font-bold uppercase tracking-widest animate-bounce cursor-pointer shadow-lg z-50 hover:bg-green-600 transition-colors" onclick="window.receiveBookData(window.squadEngine.mockData.archivist); document.getElementById('squad-modal').classList.add('hidden');">
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
