import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
const server = spawn(
  "python3",
  ["-m", "http.server", "4816", "--bind", "127.0.0.1"],
  { stdio: "ignore" },
);
let browser;
try {
  for (let i = 0; i < 30; i++) {
    try {
      await fetch("http://127.0.0.1:4816/");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      timezoneId: "Europe/Rome",
    }),
    p = await ctx.newPage(),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("http://127.0.0.1:4816/study/");
  const go = (name) =>
    p
      .getByRole("navigation")
      .getByRole("button", { name, exact: true })
      .click();
  await go("Materie");
  await p.locator("summary").first().click();
  await p
    .getByRole("button", { name: "Registra", exact: true })
    .first()
    .click();
  await p.locator("[name=start]").fill("2026-01-10T16:00");
  await p.locator("[name=end]").fill("2026-01-10T17:15");
  await p.locator("[name=progress]").fill("40");
  await p.getByRole("button", { name: "Salva", exact: true }).click();
  await go("Progressi");
  await p
    .getByText(/75 min studiati/)
    .first()
    .waitFor();
  await go("Calendario");
  await p.getByRole("button", { name: "Proponi piano" }).click();
  await p.getByRole("button", { name: "Accetta piano" }).click();
  await p.getByRole("button", { name: "Salta", exact: true }).first().click();
  await p.getByText("Saltata", { exact: true }).first().waitFor();
  await go("Strumenti");
  const dl = p.waitForEvent("download");
  await p.getByRole("button", { name: "Esporta backup" }).click();
  const path = await (await dl).path();
  p.on("dialog", (d) => d.accept());
  await p.locator("input[type=file]").last().setInputFiles(path);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload();
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  await ctx.setOffline(true);
  await p.reload();
  await go("Progressi");
  await p
    .getByText(/75 min studiati/)
    .first()
    .waitFor();
  await go("Strumenti");
  await p.getByRole("button", { name: "Modifica note" }).click();
  await p.locator("[name=notes]").fill("Appunto offline");
  await p.getByRole("button", { name: "Salva", exact: true }).click();
  await p.locator("dialog").waitFor({ state: "hidden" });
  await p.reload();
  await p.getByText("Appunto offline", { exact: true }).waitFor();
  assert.ok(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  );
  assert.deepEqual(errors, []);
  console.log(
    "OK · Chromium mobile: 75 minuti, calendario, salto, backup, offline, persistenza, layout",
  );
} finally {
  await browser?.close();
  server.kill();
}
