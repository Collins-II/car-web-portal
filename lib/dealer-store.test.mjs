import assert from "node:assert/strict";
import { test } from "node:test";
import { appointmentSchema, exportCsv, leadSchema, localDate, money, updateDealerData, vehicleSchema } from "./dealer-store.ts";

test("dealership records validate required fields and numeric boundaries", () => {
  assert.equal(vehicleSchema.safeParse({ name: "Incomplete" }).success, false);
  assert.equal(leadSchema.safeParse({ email: "not-an-email" }).success, false);
  assert.equal(appointmentSchema.safeParse({ status: "Unknown" }).success, false);
  assert.equal(localDate(new Date(2026, 0, 3)), "2026-01-03");
  assert.equal(money(42500, "USD"), "$42,500");
});

test("browser persistence validates data and never overwrites corrupt records", () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storage = new Map();
  const events = new EventTarget();
  let changes = 0;
  events.addEventListener("autohaus-data-change", () => changes++);
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: events });
  try {
    updateDealerData((data) => ({ ...data, settings: { ...data.settings, dealership: "Verified Motors" } }));
    const saved = JSON.parse(storage.get("autohaus-dealer-v1"));
    assert.equal(saved.settings.dealership, "Verified Motors");
    assert.equal(changes, 1);
    assert.throws(() => updateDealerData((data) => ({ ...data, vehicles: [{ ...data.vehicles[0], price: -1 }] })));
    assert.equal(JSON.parse(storage.get("autohaus-dealer-v1")).settings.dealership, "Verified Motors");
    storage.set("autohaus-dealer-v1", "{broken-json");
    assert.throws(() => updateDealerData((data) => data), /Unable to read browser storage/);
    assert.equal(storage.get("autohaus-dealer-v1"), "{broken-json");
    storage.set("autohaus-dealer-v1", JSON.stringify({ version: 999 }));
    assert.throws(() => updateDealerData((data) => data), /invalid/);
    assert.equal(storage.get("autohaus-dealer-v1"), '{"version":999}');
    storage.delete("autohaus-dealer-v1");
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
      getItem: () => null,
      setItem: () => { throw new Error("Quota exceeded"); },
    } });
    assert.throws(() => updateDealerData((data) => data), /could not be saved/);
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete globalThis.localStorage;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
  }
});

test("CSV exports escape quotes, preserve zeroes, and neutralize spreadsheet formulas", async () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  let exported;
  let clicked = false;
  let filename;
  URL.createObjectURL = (blob) => { exported = blob; return "blob:test"; };
  URL.revokeObjectURL = () => {};
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    body: { appendChild() {} },
    createElement: () => ({
      set href(value) { assert.equal(value, "blob:test"); },
      set download(value) { filename = value; },
      click() { clicked = true; },
      remove() {},
    }),
  } });
  try {
    exportCsv("inventory.csv", [["Stock", "Amount"], ['A "quoted" name', 0], ["=SUM(A1)", 1]]);
    assert.equal(clicked, true);
    assert.equal(filename, "inventory.csv");
    const csv = await exported.text();
    assert.ok(csv.includes('"A ""quoted"" name","0"'));
    assert.ok(csv.includes(`"'=SUM(A1)","1"`));
  } finally {
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else delete globalThis.document;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  }
});
