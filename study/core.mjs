import { starterTasks } from "./catalogue.mjs";
export const catalogue = [
  [
    "520370",
    "Russian Foreign Policy",
    "Introduction to Russia’s Foreign and Security Policy",
    "Derek Averre",
    4,
  ],
  [
    "520371",
    "Russian Foreign Policy",
    "Russia, the EU and the Common Neighbourhood",
    "Nicolò Fasola",
    4,
  ],
  [
    "560585",
    "Modernity and State-Building",
    "Empires, Nations and Modernity",
    "Marco Puleri",
    4,
  ],
  [
    "560586",
    "Modernity and State-Building",
    "Region-Making and Nation-Building",
    "Francesco Privitera",
    4,
  ],
  [
    "520284",
    "Remapping the Post-Soviet Space",
    "Remapping the Post-Soviet Space",
    "Marco Puleri",
    8,
  ],
  [
    "520308",
    "Russian Elementary",
    "Russian Elementary",
    "Simona Berardi / Liudmila Buglakova",
    8,
  ],
  [
    "520261",
    "Post-Socialist Transition",
    "Post-Socialist Transition and EU Enlargement Eastwards",
    "Francesco Privitera",
    8,
  ],
].map(([id, course, title, teacher, credits]) => ({
  id,
  course,
  title,
  teacher,
  credits,
  enabled: id !== "520261",
  exam: "",
  source:
    "https://www.unibo.it/en/study/course-units-transferable-skills-moocs/course-unit-catalogue/course-unit/2026/" +
    id,
}));
export const initial = () => ({
  version: 1,
  revision: 0,
  courses: structuredClone(catalogue),
  tasks: starterTasks(catalogue),
  sessions: [],
  plan: [],
  events: [],
  timer: null,
  notes: "",
  settings: {
    commute: 90,
    buffer: 15,
    from: 540,
    to: 1140,
    limit: 180,
    termStart: "2026-09-21",
    termEnd: "2026-12-18",
    lessons: [
      [1, 900, 1020, "Russian Elementary"],
      [3, 1020, 1140, "Russian Elementary"],
      [4, 540, 900, "Modernity · Post-Socialist · Remapping"],
      [5, 780, 1140, "Modernity · Post-Socialist · Remapping"],
    ],
  },
});
export function day(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export function addDays(date, n) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + n);
  return day(d);
}
export function fixed(s, date) {
  const cfg = s.settings,
    wd = new Date(date + "T12:00:00").getDay();
  const lessons =
    date >= cfg.termStart && date <= cfg.termEnd
      ? cfg.lessons.filter((x) => x[0] === wd)
      : [];
  return [
    ...s.events.filter((x) => x.date === date),
    ...lessons.flatMap(([, start, end, title]) => [
      {
        start: start - cfg.commute - cfg.buffer,
        end: start,
        title: "Viaggio a Forlì e margine",
      },
      { start, end, title },
      {
        start: end,
        end: end + cfg.commute + cfg.buffer,
        title: "Rientro a Bologna e margine",
      },
    ]),
  ];
}
export const overlaps = (a, b) => a.start < b.end && b.start < a.end;
export const studied = (s, id) =>
  s.sessions.filter((x) => x.task === id).reduce((n, x) => n + x.minutes, 0);
export const remaining = (t) =>
  t.done ? 0 : Math.max(1, Math.ceil(t.estimate * (1 - t.progress / 100)));
export function workLeft(s, t) {
  const actual = studied(s, t.id);
  if (!actual || !t.progress || t.done) return remaining(t);
  return Math.ceil((actual * (100 - t.progress)) / t.progress);
}
export function propose(s, first = day(), days = 28, earliest = 0) {
  const nowDay = day(),
    past = (p) =>
      p.date < nowDay ||
      (first === nowDay && p.date === first && p.end <= earliest);
  const slots = [],
    pending = new Map(),
    missed = s.plan.filter((p) => p.status === "planned" && past(p));
  const kept = s.plan.filter((p) => p.status === "planned" && !past(p));
  const deadline = (t) => {
    const exam = s.courses.find((c) => c.id === t.course)?.exam;
    return t.due || (exam ? addDays(exam, -(t.examLeadDays || 0)) : "9999-12-31");
  };
  const tasks = s.tasks
    .filter((t) => !t.done && s.courses.find((c) => c.id === t.course)?.enabled)
    .sort(
      (a, b) =>
        deadline(a).localeCompare(deadline(b)) ||
        b.priority - a.priority ||
        a.id.localeCompare(b.id),
    );
  for (const t of tasks)
    pending.set(
      t.id,
      Math.max(
        0,
        workLeft(s, t) -
          kept
            .filter((p) => p.task === t.id)
            .reduce((n, p) => n + p.end - p.start, 0),
      ),
    );
  for (let i = 0; i < days; i++) {
    const date = addDays(first, i),
      existing = kept.filter((p) => p.date === date),
      blocked = [
        ...fixed(s, date),
        ...s.plan.filter((p) => p.date === date),
        { start: 750, end: 810 },
      ];
    let budget =
      s.settings.limit - existing.reduce((n, p) => n + p.end - p.start, 0);
    let start = Math.max(s.settings.from, i === 0 ? earliest : 0);
    for (; start < s.settings.to && budget > 0; start += 5) {
      const occupied = blocked.find((e) => e.start <= start && start < e.end);
      if (occupied) {
        start = occupied.end - 5;
        continue;
      }
      const task = tasks.find(
        (t) =>
          pending.get(t.id) > 0 &&
          (!t.reviewOf || !t.due || date >= t.due) &&
          (!t.after || s.tasks.find((x) => x.id === t.after)?.done),
      );
      if (!task) break;
      const end = Math.min(
        s.settings.to,
        start + budget,
        start + 50,
        start + pending.get(task.id),
        ...blocked.filter((e) => e.start > start).map((e) => e.start),
      );
      if (end - start < Math.min(15, pending.get(task.id))) continue;
      slots.push({
        id: [date, start, task.id].join("/"),
        date,
        start,
        end,
        task: task.id,
        status: "planned",
      });
      pending.set(task.id, pending.get(task.id) - (end - start));
      budget -= end - start;
      start = end + 10 - 5;
    }
  }
  return {
    slots,
    missed,
    unplaced: [...pending].filter(([, minutes]) => minutes > 0),
    late: slots.filter(
      (p) => p.date > deadline(tasks.find((t) => t.id === p.task)),
    ),
  };
}
export function accept(s, p) {
  const missed = new Set(p.missed.map(x=>x.id));
  for (const old of s.plan) if(old.status==="planned" && missed.has(old.id)) old.status = "missed";
  const ids=new Set(s.plan.map(x=>x.id));
  s.plan.push(...p.slots.filter(x=>!ids.has(x.id)));
}
export function record(
  s,
  id,
  start,
  end,
  progress,
  notes = "",
  rating = 3,
  review = false,
) {
  const t = s.tasks.find((t) => t.id === id),
    minutes = Math.round((end - start) / 60000);
  if (
    !t ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    end > Date.now() + 1000 ||
    !Number.isFinite(progress) ||
    progress < t.progress ||
    progress > 100
  )
    throw Error("Controlla durata e avanzamento.");
  if (s.sessions.some((x) => start < x.end && end > x.start))
    throw Error("Questa sessione si sovrappone a una già registrata.");
  s.sessions.push({ task: id, start, end, minutes, notes, rating, review });
  t.progress = progress;
  t.done = progress === 100;
  if (review && !s.tasks.some((x) => x.reviewOf === id && !x.done))
    s.tasks.push({
      ...t,
      id: crypto.randomUUID(),
      title: "Ripasso · " + t.title,
      reviewOf: id,
      estimate: 20,
      progress: 0,
      done: false,
      after: "",
      due: addDays(day(new Date(end)), 2),
    });
}
export function validate(s) {
  const num = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;
  const date = (v) =>
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    addDays(v, 0) === v;
  const unique = (a) =>
    Array.isArray(a) &&
    a.every((x) => x && typeof x.id === "string" && x.id) &&
    new Set(a.map((x) => x.id)).size === a.length;
  const interval = (x) =>
    x && num(x.start, 0, 1440) && num(x.end, x.start + 1, 1440);
  const cfg = s?.settings;
  if (
    s?.version !== 1 ||
    !unique(s.courses) ||
    !unique(s.tasks) ||
    !Array.isArray(s.sessions) ||
    !Array.isArray(s.plan) ||
    !Array.isArray(s.events) ||
    !cfg ||
    !Array.isArray(cfg.lessons) ||
    typeof s.notes !== "string"
  )
    throw Error("Formato backup non valido.");
  const hasCourse = (id) => s.courses.some((c) => c.id === id),
    hasTask = (id) => s.tasks.some((t) => t.id === id);
  if (
    !num(cfg.commute, 0, 360) ||
    !num(cfg.buffer, 0, 120) ||
    !num(cfg.from, 0, 1439) ||
    !num(cfg.to, cfg.from + 1, 1440) ||
    !num(cfg.limit, 1, 1440) ||
    !date(cfg.termStart) ||
    !date(cfg.termEnd) ||
    cfg.termStart > cfg.termEnd ||
    cfg.lessons.some(
      (l) =>
        !Array.isArray(l) ||
        !num(l[0], 0, 6) ||
        !interval({ start: l[1], end: l[2] }) ||
        typeof l[3] !== "string",
    ) ||
    s.courses.some(
      (c) =>
        typeof c.title !== "string" ||
        typeof c.course !== "string" ||
        (c.exam && !date(c.exam)),
    ) ||
    s.tasks.some(
      (t) =>
        !hasCourse(t.course) ||
        typeof t.title !== "string" ||
        !num(t.progress, 0, 100) ||
        !num(t.estimate, 1, 100000) ||
        !num(t.priority, 1, 5) ||
        t.done !== (t.progress === 100) ||
        (t.due && !date(t.due)) ||
        (t.after && !hasTask(t.after)),
    ) ||
    s.sessions.some(
      (x) =>
        !hasTask(x.task) ||
        !Number.isFinite(x.start) ||
        !Number.isFinite(x.end) ||
        x.minutes !== Math.round((x.end - x.start) / 60000) ||
        x.minutes < 1,
    ) ||
    s.plan.some(
      (p) =>
        !hasTask(p.task) ||
        !date(p.date) ||
        !interval(p) ||
        !["planned", "done", "skipped", "missed"].includes(p.status),
    ) ||
    s.events.some(
      (e) => !date(e.date) || !interval(e) || typeof e.title !== "string",
    ) ||
    (s.cards &&
      (!unique(s.cards) ||
        s.cards.some(
          (c) =>
            !hasCourse(c.course) ||
            typeof c.q !== "string" ||
            typeof c.key !== "string" ||
            !Array.isArray(c.attempts) ||
            c.attempts.some(
              (a) => typeof a.correct !== "boolean" || !Number.isFinite(a.at),
            ),
        ))) ||
    (s.documents &&
      (!unique(s.documents) ||
        s.documents.some(
          (d) =>
            !hasCourse(d.course) ||
            typeof d.text !== "string" ||
            typeof d.name !== "string",
        ))) ||
    (s.quiz &&
      (!unique(s.quiz) ||
        s.quiz.some(
          (q) =>
            !hasCourse(q.course) ||
            typeof q.q !== "string" ||
            !s.documents?.some((d) => d.id === q.doc),
        ))) ||
    (s.timer && (!hasTask(s.timer.task) || !Number.isFinite(s.timer.start)))
  )
    throw Error("Il backup contiene dati incompleti.");
  return s;
}
export function replaceWorkspace(target, incoming) {
  validate(incoming);
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, structuredClone(incoming));
}
