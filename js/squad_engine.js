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
            { id: 'architect', name: 'The Architect', model: 'meta-llama/llama-4-maverick', task: 'Mermaid Structure' },
            { id: 'relationist', name: 'The Relationist', model: 'deepseek/deepseek-v3.2', task: 'Concept Mapping' },
            { id: 'extractor', name: 'The Extractor', model: 'deepseek/deepseek-v3.2', task: 'Atomic Notes' },
            { id: 'strategist', name: 'The Strategist', model: 'deepseek/deepseek-v3.2', task: 'Argument Mining' },
            { id: 'archivist', name: 'The Archivist', model: 'gpt-4o-mini', task: 'Synthesis & JSON Repair' }
        ];
        this.mockData = {};
    }

    static init(file) {
        if (!file) return;
        window.squadEngine = new SquadEngine();

        // Non-blocking: Start in background with toast notification
        showToast('🕵️ Squadra avviata in background...', 'info');

        // User can close modal and continue working
        window.squadEngine.start(file);
    }

    async start(file) {
        this.file = file;
        this.status = 'running';

        // Show Modal (user CAN close it - processing continues)
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
            showToast("Errore nella pipeline AI: " + error.message, 'error');
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
            // AUTH & CONFIG
            let apiKey = localStorage.getItem('millino_openrouter_key');
            let endpoint = "https://openrouter.ai/api/v1/chat/completions";
            let model = agent.model; // e.g., 'deepseek/deepseek-chat'
            let headers = {
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://millino-fagiolino.github.io',
                'X-Title': 'Millino Fagiolino'
            };

            // Fallback to OpenAI if OpenRouter key is missing
            if (!apiKey) {
                apiKey = localStorage.getItem('millino_openai_key');
                if (!apiKey) throw new Error("Missing API Key. Check Settings.");

                endpoint = "https://api.openai.com/v1/chat/completions";

                // Map agent models to OpenAI equivalents if needed
                // But for now, let's assume if they strictly want specific models they need OpenRouter.
                // If using OpenAI key, we force gpt-4o-mini to avoid 404s on deepseek models
                model = "gpt-4o-mini";
                headers = { 'Content-Type': 'application/json' };
            }

            headers['Authorization'] = `Bearer ${apiKey}`;

            // PAYLOAD CONSTRUCTION
            const payload = {
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `CONTEXT:\n${contextText ? contextText.slice(0, 30000) : "No Context"}` }
                ],
                temperature: 0.7
            };

            // DIRECT FETCH
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`API Error: ${response.status} - ${err.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const rawContent = data.choices[0].message.content;

            // CLEANING & PARSING
            // DeepSeek/LLMs often wrap JSON in markdown blocks
            let parsed = SquadEngine.safeJSONParse(rawContent);

            // Special Architect Handling (Mermaid Code Block)
            if (stepId === 'architect') {
                const match = rawContent.match(/```mermaid([\s\S]*?)```/);
                parsed = match ? match[1].trim() : rawContent.replace(/```/g, ''); // Fallback
            }
            // If parsing failed (and not architect), try to extract JSON block
            else if (!parsed) {
                const jsonMatch = rawContent.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) parsed = SquadEngine.safeJSONParse(jsonMatch[0]);

                if (!parsed) parsed = { error: "Parse Failed", raw: rawContent };
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
            // V6.0: Mermaid with Edit Mode Fallback
            const mermaidCode = typeof data === 'string' ? data : 'graph TD; Error["No valid diagram"];';
            const uniqueId = `mermaid-${Date.now()}`;

            html = `
                <div id="${uniqueId}-container" class="relative">
                    <div id="${uniqueId}-render" class="mermaid-render-area"></div>
                    <div id="${uniqueId}-edit" class="hidden">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] uppercase font-bold text-amber-600 tracking-wider">⚠️ Edit Mode - Mermaid rendering failed</span>
                            <button onclick="window.squadEngine.retryMermaid('${uniqueId}')" class="text-[10px] font-bold text-rose-500 hover:text-rose-700">↻ Retry Render</button>
                        </div>
                        <textarea id="${uniqueId}-code" class="w-full h-32 text-[10px] font-mono bg-stone-900 text-green-400 p-2 rounded-lg border border-stone-700 resize-none" spellcheck="false">${mermaidCode}</textarea>
                    </div>
                </div>
            `;

            outputBox.innerHTML = html;

            // Attempt Mermaid Render with Error Fallback
            setTimeout(() => {
                try {
                    const renderArea = document.getElementById(`${uniqueId}-render`);
                    const editArea = document.getElementById(`${uniqueId}-edit`);

                    // Create mermaid element
                    const mermaidEl = document.createElement('div');
                    mermaidEl.className = 'mermaid';
                    mermaidEl.textContent = mermaidCode;
                    renderArea.appendChild(mermaidEl);

                    mermaid.init(undefined, mermaidEl);

                    // Check if render was successful (mermaid replaces content with SVG)
                    setTimeout(() => {
                        if (!renderArea.querySelector('svg')) {
                            // Rendering failed, show Edit Mode
                            renderArea.classList.add('hidden');
                            editArea.classList.remove('hidden');
                            showToast('Mermaid render fallito. Modalità Edit attiva.', 'warning');
                        }
                    }, 1000);

                } catch (e) {
                    console.error('Mermaid render error:', e);
                    const renderArea = document.getElementById(`${uniqueId}-render`);
                    const editArea = document.getElementById(`${uniqueId}-edit`);
                    if (renderArea) renderArea.classList.add('hidden');
                    if (editArea) editArea.classList.remove('hidden');
                    showToast('Errore Mermaid: ' + e.message, 'error');
                }
            }, 500);

            return; // Early return since we handled innerHTML already

        } else if (id === 'relationist' && Array.isArray(data)) {
            // Enhanced relation display with hover effects
            html = `<div class="space-y-2">` +
                data.map(d => `
                    <div class="flex items-center gap-2 text-xs p-2 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors cursor-default">
                        <span class="font-bold text-stone-800">${d.source}</span>
                        <span class="bg-rose-100 text-rose-600 px-2 py-0.5 text-[10px] font-medium rounded-full">${d.relation}</span>
                        <span class="font-bold text-stone-800">${d.target}</span>
                    </div>
                `).join('') +
                `</div>`;

        } else if (id === 'extractor' && Array.isArray(data)) {
            // Enhanced quote cards
            html = `<div class="space-y-3">` +
                data.map(q => `
                    <div class="bg-gradient-to-r from-rose-50 to-white p-3 rounded-lg border-l-2 border-rose-300 hover:border-rose-500 transition-all">
                        <div class="italic text-stone-600 text-[11px] mb-2 leading-relaxed">"${q.quote}"</div>
                        <div class="text-xs font-medium text-stone-800 mb-1">${q.paraphrase}</div>
                        <span class="inline-block text-[9px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-medium">#${q.tag}</span>
                    </div>
                `).join('') +
                `</div>`;

        } else if (id === 'strategist' && Array.isArray(data)) {
            // Enhanced strategy list with icons
            html = `<ul class="space-y-2 text-xs text-stone-600">` +
                data.map((s, i) => `
                    <li class="flex items-start gap-2 p-2 bg-stone-50 rounded-lg">
                        <span class="w-5 h-5 bg-stone-800 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">${i + 1}</span>
                        <span class="leading-relaxed">${s}</span>
                    </li>
                `).join('') +
                `</ul>`;

        } else if (id === 'archivist' && typeof data === 'object') {
            // Final archive summary card
            html = `
                <div class="space-y-3">
                    <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <span class="text-2xl">📚</span>
                        <div>
                            <div class="font-bold text-stone-800 text-sm">${data.title || 'Titolo'}</div>
                            <div class="text-[10px] text-stone-500">${data.author || 'Autore'}</div>
                        </div>
                    </div>
                    ${data.atomic_notes ? `
                        <div class="text-[10px] uppercase font-bold text-stone-400 tracking-wider">📝 Note Atomiche: ${data.atomic_notes.length}</div>
                    ` : ''}
                </div>
            `;

        } else {
            // Default JSON view
            html = `<pre class="text-[10px] bg-stone-900 text-green-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>`;
        }

        outputBox.innerHTML = html;
    }

    // V6.0: Retry Mermaid Render from Edit Mode
    retryMermaid(uniqueId) {
        const codeEl = document.getElementById(`${uniqueId}-code`);
        const renderArea = document.getElementById(`${uniqueId}-render`);
        const editArea = document.getElementById(`${uniqueId}-edit`);

        if (!codeEl || !renderArea || !editArea) return;

        const newCode = codeEl.value.trim();
        renderArea.innerHTML = '';

        try {
            const mermaidEl = document.createElement('div');
            mermaidEl.className = 'mermaid';
            mermaidEl.textContent = newCode;
            renderArea.appendChild(mermaidEl);

            mermaid.init(undefined, mermaidEl);

            setTimeout(() => {
                if (renderArea.querySelector('svg')) {
                    editArea.classList.add('hidden');
                    renderArea.classList.remove('hidden');
                    showToast('Mermaid renderizzato con successo!', 'success');
                } else {
                    showToast('Render ancora fallito. Controlla la sintassi.', 'warning');
                }
            }, 500);

        } catch (e) {
            showToast('Errore: ' + e.message, 'error');
        }
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
                        <div>SQUAD V5.0 POWERED BY LUCA&JESSE</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    complete(finalData) {
        // Non-blocking: Auto-save with squad_analysis schema
        const archivistData = this.mockData.archivist;
        const title = archivistData?.title || this.file?.name || 'Unknown';

        // Build squad_analysis object with proper schema
        const squadAnalysis = {
            architect: { content: this.mockData.architect, status: 'done' },
            relationist: { content: this.mockData.relationist, status: 'done' },
            extractor: { content: this.mockData.extractor, status: 'done' },
            strategist: { content: this.mockData.strategist, status: 'done' }
        };

        // Create new book object
        const newBook = {
            id: Date.now(),
            title: archivistData?.title || 'Titolo Estratto',
            author: archivistData?.author || 'Autore Sconosciuto',
            year: archivistData?.year || new Date().getFullYear(),
            pub: archivistData?.pub || 'Editore Ignoto',
            desc: archivistData?.desc || 'Descrizione generata dalla Squad AI.',
            cat: 'Squad Imported',
            status: 'todo',
            notes: '',
            tags: [],
            squad_analysis: squadAnalysis,
            pdfPath: this.file?.name || null,
            processedAt: new Date().toISOString()
        };

        // Add to biblioData and save
        if (typeof biblioData !== 'undefined') {
            biblioData.unshift(newBook);
            if (typeof saveData === 'function') saveData();
        }

        // Show success toast (no ugly popup!)
        showToast(`✅ Squad: "${title}" aggiunto!`, 'success');

        // Remove processing badge if exists
        const processingBadge = document.getElementById(`squad-processing-${newBook.id}`);
        if (processingBadge) processingBadge.remove();

        // Auto-close modal after brief delay
        setTimeout(() => {
            document.getElementById('squad-modal')?.classList.add('hidden');
        }, 1500);

        // Refresh UI
        if (typeof runSearch === 'function') runSearch();
        if (typeof CitationEngine !== 'undefined') CitationEngine.render();

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
