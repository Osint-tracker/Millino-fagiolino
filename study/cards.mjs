export const normalizeAnswer = (text) =>
  text.normalize("NFC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
export function verifyAnswer(card, answer, at = Date.now()) {
  const correct = normalizeAnswer(card.key) === normalizeAnswer(answer);
  (card.attempts ??= []).push({ at, correct });
  return correct;
}
export function cardsUI({
  state,
  view,
  el,
  meta,
  box,
  row,
  button,
  edit,
  field,
  change,
  notify,
}) {
  const cards = state.cards || [];
  const panel = box(
    el("h3", "Verifica a risposta breve"),
    meta(
      "Crea una domanda con una risposta univoca. Il confronto ignora maiuscole e spazi superflui.",
    ),
  );
  panel.append(
    button("Crea domanda", () =>
      edit(
        "Nuova verifica",
        [
          field("course", "Modulo", "select", state.courses[0].id, {
            choices: state.courses.map((c) => [c.id, c.title]),
          }),
          field("q", "Domanda", "text", "", { required: true }),
          field("key", "Risposta attesa", "text", "", { required: true }),
        ],
        (f) =>
          change((s) =>
            (s.cards ??= []).push({
              id: crypto.randomUUID(),
              ...f,
              attempts: [],
            }),
          ),
      ),
    ),
  );
  for (const card of cards)
    panel.append(
      button(card.q, () =>
        edit(
          "Rispondi",
          [
            el("p", card.q),
            field("answer", "Risposta", "text", "", { required: true }),
          ],
          async (f) => {
            let ok = false;
            await change((s) => {
              ok = verifyAnswer(
                s.cards.find((c) => c.id === card.id),
                f.answer,
              );
            });
            notify(ok ? "Risposta corretta." : "Risposta attesa: " + card.key);
          },
          "Verifica",
        ),
      ),
    );
  view.append(panel);
}
export function assistantUI({
  state,
  view,
  el,
  meta,
  box,
  row,
  button,
  edit,
  field,
  notify,
}) {
  const panel = box(el("h3", "Consulta l’assistente AI"));
  panel.append(
    button("Chiedi sui miei studi", () =>
      edit(
        "Assistente privato",
        [
          field(
            "endpoint",
            "Endpoint HTTPS del tuo backend",
            "url",
            location.protocol === "https:" && !window.MireesNative
              ? location.origin + "/api/chat"
              : "",
            { required: true },
          ),
          field("token", "Token di accesso personale", "password", "", {
            required: true,
          }),
          field("question", "Domanda", "textarea", "", { required: true }),
          meta(
            "Con Invia condividi domanda, argomenti, scadenze, avanzamento e piano con il backend indicato e il provider AI. Appunti e documenti sono esclusi.",
          ),
        ],
        async (f) => {
          const url = new URL(f.endpoint);
          if (url.protocol !== "https:" || url.username || url.password)
            throw Error("Usa un endpoint HTTPS.");
          const payload = {
            message: f.question,
            context: {
              courses: state.courses.map((c) => [c.title, c.exam]),
              tasks: state.tasks.map((t) => [t.id, t.title, t.progress]),
              plan: state.plan
                .filter((p) => p.status === "planned")
                .slice(0, 50),
            },
            systemOverride:
              "Rispondi in italiano con i soli dati dello studente. Distingui stime e fatti. Non puoi modificare il calendario.",
          };
          const r = await fetch(url, {
            method: "POST",
            redirect: "error",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + f.token,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(35000),
          });
          if (!r.ok) throw Error("Il backend ha risposto " + r.status + ".");
          const answer = (await r.json()).choices?.[0]?.message?.content;
          if (!answer) throw Error("Risposta vuota.");
          setTimeout(
            () => edit("Risposta", [el("p", answer)], () => {}, "Chiudi"),
            0,
          );
        },
        "Invia al provider",
      ),
    ),
  );
  view.append(panel);
}
