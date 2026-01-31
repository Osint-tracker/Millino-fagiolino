# 🤖 SPEC_OS_DRIVEN.md (AI Guideline)

> **CRITICAL**: This document dictates the behavior of any AI Agent (Cursor, Windsurf, Bolt, Gemini) modifying this codebase.
> **VIOLATION OF THESE RULES CAUSES SYSTEM INSTABILITY.**

---

## 🎨 1. Design System & UI
**Philosophy**: "Academic Zen". The UI must feel like a quiet library.

- **Palette**: STRICTLY use `stone-50` to `stone-900` for structure. Use `rose-500`/`rose-100` for accents (badges, buttons, active states).
- **Glassmorphism**: When using transparencies, ALWAYS pair `bg-white/80` (or similar) with `backdrop-blur-sm` or `backdrop-blur-md`.
- **Interactions**:
    - **No Alert()**: NEVER use `window.alert()` or `window.confirm()`.
    - **Use Toast**: `showToast(msg, 'success'|'error'|'warning')`.
    - **Use Confirm Modal**: `showConfirmModal(msg, callback)`.

## 💻 2. Architecture & File System
**Philosophy**: "Forkable & Local".

- **Paths**: NEVER use absolute paths (e.g., `/js/database.js`). ALWAYS use relative paths (e.g., `./js/database.js`) to ensure GitHub Pages compatibility in subdirectories.
- **Backend Agnostic**: NEVER assume a server exists. Do not call `/api/...` endpoints unless they are external (OpenAI/Jina).
- **State**: `LocalStorage` is the ONLY persistence layer. `MASTER_DB` in `database.js` is the seed; `millino_custom_books` is the tree.

## 🧠 3. Intelligence (AI Logic)
**Philosophy**: "Pedantic Parsing".

- **Models**:
    - **Default Chat**: `gpt-4o-mini` (Fast, cheap, reliable for JSON repair).
    - **Advanced Task**: `deepseek/deepseek-v3.2` (via OpenRouter) or `qwen/qwen2.5-vl-72b-instruct`.
- **Parsing**:
    - AI models (especially DeepSeek) LOVE to wrap JSON in Markdown.
    - **ALWAYS** use `squadEngine.safeJSONParse()` (from `squad_engine.js`) or equivalent regex replacement (`replace(/```json|```/g, '')`) before parsing.
    - **NEVER** trust `JSON.parse()` blindly on LLM output.

## 🐕 4. The Jesse Personas
**Philosophy**: "More than a Chatbot".

- **Persistence**: Jesse's state (`currentJesseMode`) MUST be injected into the System Prompt of *every* API call (even "hidden" ones like Syllabus Import).
- **Modes**:
    - `standard`: Helpful assistant.
    - `socrajess`: Only asks questions.
    - `critic`: Harsh academic review.
    - `discuss`: Roleplay defense.
- **Injection**: `const basePersona = JESSE_PERSONAS[currentJesseMode];` must be the first line of constructing context.

---

## 🚫 5. Strictly Forbidden
1. **DO NOT** create a `server.js` or `express` app.
2. **DO NOT** use `axios`. Use `fetch`.
3. **DO NOT** use `colors: { primary: ... }` in Tailwind config. Use literal color names (`rose`, `stone`).
