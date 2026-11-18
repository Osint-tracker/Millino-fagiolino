import { initial, validate } from "./core.mjs";
const db = new Promise((resolve, reject) => {
  const r = indexedDB.open("mirees-study-os", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("workspace");
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});
export async function load() {
  const r = (await db)
    .transaction("workspace")
    .objectStore("workspace")
    .get("state");
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result ? validate(r.result) : initial());
    r.onerror = () => reject(r.error);
  });
}
export async function save(state, expected) {
  validate(state);
  const tx = (await db).transaction("workspace", "readwrite"),
    store = tx.objectStore("workspace"),
    r = store.get("state");
  return new Promise((resolve, reject) => {
    r.onsuccess = () => {
      if ((r.result?.revision ?? 0) !== expected) {
        tx.abort();
        return;
      }
      store.put({ ...state, revision: expected + 1 }, "state");
    };
    tx.oncomplete = () => resolve({ ...state, revision: expected + 1 });
    tx.onabort = () =>
      reject(
        tx.error ||
          Error(
            "Dati aggiornati in un’altra scheda. Ricarica prima di salvare.",
          ),
      );
    tx.onerror = () => reject(tx.error);
  });
}
