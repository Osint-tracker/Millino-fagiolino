// Le etichette delle attività sono proposte di studio. Le date personali restano vuote.
export const outlines = {
  520370: [
    "Essay o policy brief di 2.500 parole ±10%, note incluse e bibliografia esclusa. Titolo e consegna da confermare.",
    [
      "Confrontare due interpretazioni della politica estera russa",
      "Definire la domanda del policy brief",
      "Preparare una scaletta argomentata",
      "Stendere e revisionare il testo",
    ],
    [
      "Sakwa (2017), Russia Against the Rest",
      "Tsygankov (2019), Russia’s Foreign Policy",
    ],
  ],
  520371: [
    "Partecipazione 10%, presentazione di gruppo 40%, orale 50%. Frequenza minima 70%.",
    [
      "Ricostruire le fasi delle relazioni Russia–UE",
      "Confrontare gli interessi nel vicinato comune",
      "Preparare una risposta orale sul caso scelto",
    ],
    [
      "Averre (2009), Competing Rationalities",
      "Bordachev (2019), Russia and Europe",
    ],
  ],
  560585: [
    "Orale con discussione delle letture e confronto fra approcci.",
    [
      "Confrontare impero e nazione",
      "Discutere modernità e formazione dello Stato",
      "Preparare un confronto orale tra due letture",
    ],
    [],
  ],
  560586: [
    "Orale con riferimenti alle fonti e confronto tra teoria e politiche.",
    [
      "Ricostruire un caso di nation-building",
      "Confrontare due interpretazioni del region-making",
      "Esporre il caso collegandolo a una fonte",
    ],
    [],
  ],
  520284: [
    "Per frequentanti, presentazione e paper valgono insieme il 50%, orale 50%. Paper fino a 5.000 parole, da inviare almeno 15 giorni prima dell’orale.",
    [
      "Concordare un caso di studio",
      "Raccogliere le fonti sul caso",
      "Preparare la prima stesura del paper",
      "Revisionare e inviare il paper",
      "Preparare la discussione orale",
    ],
    [],
  ],
  520308: [
    "Tre prove scritte intermedie e una prova orale. Gli scritti sono propedeutici all’orale.",
    [
      "Ripassare coniugazioni al presente",
      "Descrivere la propria giornata",
      "Esercitare domande e risposte sulla famiglia",
      "Simulare una verifica scritta",
    ],
    [],
  ],
  520261: [
    "Valutazione illustrata a lezione. Esame invernale su conferma personale.",
    ["Confrontare due percorsi di transizione post-socialista"],
    [],
  ],
};
export function starterTasks(courses) {
  return courses.flatMap((c) =>
    outlines[c.id][1].map((title, i) => ({
      id: c.id + "-" + i,
      course: c.id,
      title,
      estimate: 50,
      progress: 0,
      done: false,
      priority: 2,
      after: "",
      due: "",
      examLeadDays: c.id === "520284" && i < 4 ? 15 : 0,
      kind: "Studio",
      source: "Proposta di studio modificabile",
    })),
  );
}
