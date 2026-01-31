# 🐕 Millino Fagiolino (Research OS v6.0)
> **Client-Side Research OS for PhD Candidates.**
> *Forged in the fires of late-night study sessions.*

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-6.0-rose.svg) ![Status](https://img.shields.io/badge/status-Stable-green.svg)

## 🔭 Vision
**Millino Fagiolino** is not just a dashboard; it's a **Client-Side Operating System** designed to manage the chaos of a doctoral thesis. 
Unlike traditional tools (Notion, Obsidian) which are either too rigid or too blank, Millino provides a **structured, opinionated workflow** centered around:
1. **Deep Reading**: Turning PDFs into atomic notes via AI agents.
2. **Syllabus Parsing**: Instantly converting chaotic exam programs into structured modules.
3. **Thesis Strategy**: Shaping raw knowledge into academic arguments.

It runs entirely in your browser using **LocalStorage** for speed and privacy. No backend, no login, just you and your research.

---

## ✨ Features (Verified)

### 🧠 Active Intelligence (The Squad)
A specialized team of AI Agents performs a "forensic analysis" on your PDF sources.
- **The Architect**: Generates `Mermaid.js` diagrams of the book's structure.
- **The Relationist**: Maps conceptual connections (Concept A -> refutes -> Concept B).
- **The Extractor**: Mines "Atomic Notes" suitable for direct citation.
- **The Strategist**: Suggests academic arguments based on the text.
*Powered by DeepSeek V3.2 / Qwen via OpenRouter.*

### 🎓 Exam Mode & Syllabus Importer
Don't type manually. Paste your exam program text or URL.
- **Jina Reader Integration**: Fetches clean text from any URL (`https://r.jina.ai/...`).
- **DeepSeek Parser**: transforming messy syllabus text into structured JSON modules.
- **Auto-Linking**: Intelligent guessing connects syllabus topics to your existing bibliography.

### ⏱️ Focused Work
- **Pomodoro 2.0**: Integrated timer with "Focus" (25m) and "Coffee Break" (7m) modes.
- **Zen Mode**: A distraction-free, full-screen writing environment.
- **Soundscapes**: Rain, Cafe, and Fireplace audio built-in.

### 📊 Metric Tracking
- **Word Tracker**: Daily thesis word count visualization.
- **Reading Progress**: Visual bars for 'Todo', 'Reading', and 'Done' states.

### ☁️ Data & Sync
- **Local First**: All data (`MASTER_DB`, `courses`) lives in your browser's LocalStorage.
- **Gist Ready**: Settings panel includes fields for GitHub Token & Gist ID (Sync implementation pending/manual).

---

## 🛠️ Setup & Installation

### 1. "Fork & Go" (GitHub Pages)
This project is designed to be hosted for free on GitHub Pages.
1. **Fork** this repository.
2. Go to **Settings > Pages**.
3. Set source to `main` branch.
4. Open your new URL (e.g., `username.github.io/millino-fagiolino`).

### 2. API Key Configuration
To unlock the AI features (The Squad, Jesse, Syllabus Import), you must configure your keys.
1. Click the **Settings Gear ⚙️** (bottom-left).
2. **OpenAI API Key**: Required for basic repair tasks (`gpt-4o-mini`).
3. **OpenRouter Key** (Recommended): Required for **DeepSeek** and **Qwen** models aka "The Squad".
4. Keys are saved securely in your browser's LocalStorage. They are **never** transmitted to any server other than the API provider.

---

## 🏗️ Tech Stack
- **Core**: HTML5, Vanilla JS (ES6+).
- **Styling**: TailwindCSS (CDN).
- **Visualization**: Chart.js, Mermaid.js.
- **PDF Handling**: PDF.js (Mozilla).
- **Effects**: Canvas Confetti.

---

> *"Bau!"* - Jesse (Principal AI Architect)
