import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const server = spawn(
  "python3",
  ["-m", "http.server", "4817", "--bind", "127.0.0.1"],
  { stdio: "ignore" },
);
let browser;
function pdf() {
  const txt =
    "BT /F1 12 Tf 40 750 Td (What causes institutional change?) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " + txt.length + " >>\nstream\n" + txt + "\nendstream",
  ];
  let str = "%PDF-1.4\n",
    offsets = ["0000000000 65535 f "];
  for (const [i, obj] of objects.entries()) {
    offsets.push(String(str.length).padStart(10, "0") + " 00000 n ");
    str += i + 1 + " 0 obj\n" + obj + "\nendobj\n";
  }
  const offset = str.length;
  return Buffer.from(
    str +
      "xref\n0 6\n" +
      offsets.join("\n") +
      "\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" +
      offset +
      "\n%%EOF",
  );
}
try {
  for (let i = 0; i < 30; i++) {
    try {
      await fetch("http://127.0.0.1:4817/");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const ctx = await browser.newContext({ serviceWorkers: "block" }),
    p = await ctx.newPage(),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("dialog", (d) => d.accept());
  await p.route("**/api/syllabus?*", (r) =>
    r.fulfill({
      json: {
        html: "<section><h2>Course contents</h2><p>Topic from source</p></section><section><h2>Readings/Bibliography</h2><p>Text from source</p></section>",
      },
    }),
  );
  await p.goto("http://127.0.0.1:4817/dist/");
  const go = (n) =>
    p
      .getByRole("navigation")
      .getByRole("button", { name: n, exact: true })
      .click();
  await go("Materie");
  await p.locator("summary").first().click();
  await p.getByRole("button", { name: "Importa syllabus" }).first().click();
  assert.match(
    await p.locator("[name=lines]").inputValue(),
    /Topic from source/,
  );
  await p.locator("[name=lines]").fill("Argomento confermato");
  await p.getByRole("button", { name: "Importa righe confermate" }).click();
  await p.locator("dialog").waitFor({ state: "hidden" });
  await go("Strumenti");
  await p
    .locator('input[accept="application/pdf"]')
    .setInputFiles({
      name: "exam.pdf",
      mimeType: "application/pdf",
      buffer: pdf(),
    });
  await p.locator("[name=text]").waitFor();
  assert.match(
    await p.locator("[name=text]").inputValue(),
    /institutional change/,
  );
  await p.getByRole("button", { name: "Salva", exact: true }).click();
  await p.getByText("exam.pdf", { exact: true }).click();
  await p.getByRole("button", { name: "Estrai domande" }).click();
  await p.getByRole("button", { name: "Inizia verifica" }).click();
  await p
    .getByText("What causes institutional change?", { exact: true })
    .last()
    .waitFor();
  await p.getByRole("button", { name: "Annulla" }).click();
  let blob = "",
    etag = '"1"',
    conflicts = 0;
  await p.route("https://dav.example.test/backup", async (r) => {
    const method = r.request().method();
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Expose-Headers": "ETag",
      ETag: etag,
    };
    if (method === "OPTIONS") return r.fulfill({ status: 204, headers });
    if (method === "PUT") {
      if (blob && r.request().headers()["if-match"] !== etag) {
        conflicts++;
        return r.fulfill({ status: 412, headers });
      }
      blob = r.request().postData();
      return r.fulfill({ status: 201, headers });
    }
    return r.fulfill({ headers, body: blob });
  });
  const sync = async (mode) => {
    await p.getByRole("button", { name: "Sincronizzazione privata" }).click();
    await p.locator("[name=url]").fill("https://dav.example.test/backup");
    await p.locator("[name=pass]").fill("test-locale-passphrase");
    await p.locator("[name=mode]").selectOption(mode);
    await p.getByRole("button", { name: "Continua", exact: true }).click();
  };
  await sync("push");
  await p.locator("dialog").waitFor({ state: "hidden" });
  assert.ok(blob && !blob.includes("Argomento confermato"));
  await sync("pull");
  await p.locator("dialog").waitFor({ state: "hidden" });
  etag = '"2"';
  await sync("push");
  await p.getByRole("alert").waitFor();
  assert.equal(conflicts, 1);
  assert.deepEqual(errors, []);
  console.log(
    "OK · Browser: bozza syllabus modificabile, PDF reale, domande persistenti, backup cifrato e conflitto ETag",
  );
} finally {
  await browser?.close();
  server.kill();
}
