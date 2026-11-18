import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  propose,
  accept,
  overlaps,
  fixed,
  record,
  studied,
  remaining,
  validate,
  addDays,
} from "../study/core.mjs";
test("proposta deterministica; lezioni, treni, capienza e post-socialist escluso", () => {
  const s = initial(),
    snapshot = structuredClone(s),
    p = propose(s, "2026-11-18", 10);
  assert.deepEqual(s, snapshot);
  assert.deepEqual(p, propose(s, "2026-11-18", 10));
  assert.ok(p.slots.length > 0);
  for (const slot of p.slots) {
    assert.ok(!fixed(s, slot.date).some((e) => overlaps(e, slot)));
    assert.ok(
      !p.slots.some(
        (e) => e !== slot && e.date === slot.date && overlaps(e, slot),
      ),
    );
    assert.notEqual(s.tasks.find((x) => x.id === slot.task).course, "520261");
  }
  accept(s, p);
  assert.equal(propose(s, "2026-11-18", 10).slots.length, 0);
});
test("75 minuti e ripasso con avanzamento esplicito, backup completo", () => {
  const s = initial(),
    t = s.tasks[0],
    end = Date.now();
  record(s, t.id, end - 75 * 60000, end, 40, "Prima sezione", 3, true);
  assert.equal(studied(s, t.id), 75);
  assert.equal(remaining(t), 30);
  assert.equal(t.done, false);
  assert.equal(s.tasks.at(-1).reviewOf, t.id);
  assert.deepEqual(validate(JSON.parse(JSON.stringify(s))), s);
  assert.throws(() => record(s, t.id, end - 60 * 60000, end, 50));
  assert.throws(() => validate({ ...s, sessions: [{ task: "assente" }] }));
});
test("un impegno saltato libera solo il lavoro residuo; dipendenze e limiti", () => {
  const s = initial();
  s.tasks = s.tasks.slice(0, 2);
  s.tasks[1].after = s.tasks[0].id;
  s.settings.limit = 20;
  accept(s, propose(s, "2026-11-18", 1));
  s.plan[0].status = "skipped";
  s.tasks[0].progress = 60;
  const p = propose(s, "2026-11-19", 2);
  assert.equal(
    p.slots.reduce((n, x) => n + x.end - x.start, 0),
    20,
  );
  assert.ok(p.slots.every((x) => x.task === s.tasks[0].id));
});
test("scadenza superata segnalata; sette giorni su cambio ora", () => {
  const s = initial();
  s.tasks[0].due = "2026-10-01";
  assert.ok(propose(s, "2026-11-18", 1).late.length);
  assert.equal(addDays("2026-10-24", 2), "2026-10-26");
});
