const questions = (text) => [
  ...new Set(
    text
      .split(/\n|(?<=[?])\s+/)
      .map((x) => x.trim())
      .filter((x) => x.endsWith("?") && x.length >= 8 && x.length <= 500),
  ),
];
async function pdfText(file) {
  if (file.size > 20 * 1024 * 1024)
    throw Error("Seleziona un PDF inferiore a 20 MB.");
  const pdfjs = await import("./vendor/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "./vendor/pdf.worker.mjs",
    import.meta.url,
  ).href;
  const loading = pdfjs.getDocument({
    data: await file.arrayBuffer(),
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const doc = await loading.promise;
  let text = "";
  try {
    for (let i = 1; i <= doc.numPages && text.length < 160000; i++) {
      const p = await doc.getPage(i),
        data = await p.getTextContent();
      text +=
        data.items.map((x) => x.str + (x.hasEOL ? "\n" : " ")).join("") + "\n";
    }
  } finally {
    await loading.destroy();
  }
  if (!text.trim())
    throw Error("Nessun testo estraibile. Per una scansione serve OCR.");
  return text.slice(0, 160000);
}
export function lab({
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
  const docs = state.documents || [],
    quiz = state.quiz || [],
    tasks = state.tasks.filter(
      (t) => !t.done && state.courses.find((c) => c.id === t.course)?.enabled,
    );
  const select = () =>
    field("course", "Modulo", "select", state.courses[0]?.id, {
      choices: state.courses.map((c) => [c.id, c.title]),
    });
  const library = box(
    el("h3", "Biblioteca e domande"),
    meta("Il testo estratto resta sul dispositivo."),
  );
  const upload = field("pdf", "Importa PDF con testo", "file");
  upload.lastChild.accept = "application/pdf";
  upload.onchange = async (e) => {
    try {
      const f = e.target.files[0];
      if (!f) return;
      const txt = await pdfText(f);
      edit(
        "Archivia documento",
        [
          select(),
          field("name", "Titolo", "text", f.name, { required: true }),
          field(
            "text",
            "Testo estratto · controlla prima di salvare",
            "textarea",
            txt,
            { required: true },
          ),
        ],
        (f) =>
          change((s) =>
            (s.documents ??= []).push({ id: crypto.randomUUID(), ...f }),
          ),
      );
    } catch (err) {
      notify(err.message);
    }
  };
  library.append(
    upload,
    button("Aggiungi testo o domande", () =>
      edit(
        "Documento",
        [
          select(),
          field("name", "Titolo", "text", "", { required: true }),
          field("text", "Testo", "textarea", "", { required: true }),
        ],
        (f) =>
          change((s) =>
            (s.documents ??= []).push({ id: crypto.randomUUID(), ...f }),
          ),
      ),
    ),
  );
  for (const doc of docs) {
    const det = el("details");
    det.append(
      el("summary", doc.name),
      el("p", doc.text),
      button("Estrai domande", async () => {
        const qs = questions(doc.text).filter(
          (q) => !quiz.some((x) => x.doc === doc.id && x.q === q),
        );
        if (!qs.length)
          return notify("Nessuna nuova domanda esplicita trovata.");
        await change((s) => {
          s.quiz ??= [];
          s.quiz.push(
            ...qs.map((q) => ({
              id: crypto.randomUUID(),
              course: doc.course,
              doc: doc.id,
              q,
            })),
          );
        });
      }),
    );
    library.append(det);
  }
  view.append(library);
  const exam = box(
    el("h3", "Simulazione orale"),
    meta(quiz.length + " domande salvate"),
  );
  if (quiz.length)
    exam.append(
      button("Inizia verifica", () => {
        const q = quiz.slice().sort((a, b) => (a.last || 0) - (b.last || 0))[0],
          doc = docs.find((d) => d.id === q.doc);
        edit(
          "Verifica orale",
          [
            el("p", q.q),
            field("answer", "La tua risposta", "textarea", "", {
              required: true,
            }),
            el("details"),
          ],
          async (f) => {
            await change((s) => {
              const item = s.quiz.find((x) => x.id === q.id);
              item.answer = f.answer;
              item.last = Date.now();
              item.score = null;
            });
            queueMicrotask(() =>
              setTimeout(
                () =>
                  edit(
                    "Confronta con il materiale",
                    [
                      el("p", f.answer),
                      el(
                        "p",
                        doc?.text.slice(0, 4000) || "Consulta le tue fonti.",
                      ),
                      field(
                        "score",
                        "Autovalutazione dopo il confronto (1–5)",
                        "number",
                        3,
                        { required: true, min: 1, max: 5 },
                      ),
                    ],
                    (g) =>
                      change(
                        (s) =>
                          (s.quiz.find((x) => x.id === q.id).score = +g.score),
                      ),
                  ),
                0,
              ),
            );
          },
          "Confronta",
        );
      }),
    );
  for (const q of quiz.filter((q) => q.score))
    exam.append(meta(q.q + " · autovalutazione " + q.score + "/5"));
  view.append(exam);
  const next = state.plan
    .filter((p) => p.status === "planned")
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)[0];
  view.append(
    box(
      el("h3", "Assistente studio"),
      el(
        "p",
        next
          ? "Prossima sessione in agenda · " +
              next.date +
              " · " +
              state.tasks.find((t) => t.id === next.task).title
          : "Nessuna sessione confermata.",
      ),
      button("Ho un’ora libera", () => {
        const t = tasks
          .filter(
            (t) =>
              (!t.after || state.tasks.find((x) => x.id === t.after)?.done) &&
              t.estimate * (1 - t.progress / 100) <= 60,
          )
          .sort((a, b) => b.priority - a.priority)[0];
        notify(t ? t.title : "Nessuna attività disponibile entro un’ora.");
      }),
    ),
  );
}
