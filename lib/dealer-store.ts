"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

export const vehicleSchema = z.object({
  id: z.string(), name: z.string().min(2), year: z.number().int().min(1900).max(2100),
  price: z.number().positive(), mileage: z.number().nonnegative(), fuel: z.enum(["Petrol", "Diesel", "Electric", "Hybrid"]),
  transmission: z.enum(["Automatic", "Manual"]), body: z.enum(["SUV", "Sedan", "Coupe", "Truck", "Hatchback"]),
  status: z.enum(["Available", "Reserved", "Sold"]), image: z.string(), stock: z.string().min(1), added: z.string(),
});
export const leadSchema = z.object({
  id: z.string(), name: z.string().min(2), email: z.email(), phone: z.string(), vehicleId: z.string(),
  stage: z.enum(["New", "Contacted", "Test drive", "Negotiation", "Won", "Lost"]),
  source: z.enum(["Website", "Walk-in", "Referral", "Social media"]), created: z.string(),
});
export const appointmentSchema = z.object({
  id: z.string(), customer: z.string().min(2), vehicleId: z.string(), date: z.string(), time: z.string(),
  type: z.enum(["Test drive", "Vehicle delivery", "Consultation"]), status: z.enum(["Scheduled", "Completed", "Cancelled"]),
});
export const saleSchema = z.object({
  id: z.string(), customer: z.string(), vehicleId: z.string(), amount: z.number().positive(),
  date: z.string(), payment: z.enum(["Cash", "Finance", "Bank transfer"]),
});
const settingsSchema = z.object({
  dealership: z.string().min(2), name: z.string().min(2), email: z.email(), phone: z.string(),
  currency: z.enum(["USD", "ZMW", "GBP", "EUR"]), address: z.string(), notifications: z.boolean(),
});
const storeSchema = z.object({
  version: z.literal(1), vehicles: z.array(vehicleSchema), leads: z.array(leadSchema),
  appointments: z.array(appointmentSchema), sales: z.array(saleSchema), settings: settingsSchema,
});
export type Vehicle = z.infer<typeof vehicleSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type Sale = z.infer<typeof saleSchema>;
export type DealerData = z.infer<typeof storeSchema>;
export type DealerSettings = z.infer<typeof settingsSchema>;

const today = new Date();
export function dateOffset(days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return localDate(date);
}
export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const carImages = {
  bmw: "/cars/bmw.jpg",
  mercedes: "/cars/mercedes.jpg",
  porsche: "/cars/porsche.jpg",
  audi: "/cars/audi.jpg",
};

const seed: DealerData = {
  version: 1,
  settings: { dealership: "Autohaus Motors", name: "Alex Morgan", email: "alex@autohaus.example", phone: "+1 (415) 555-0124", currency: "USD", address: "1200 California Street, San Francisco, CA", notifications: true },
  vehicles: [
    { id: "v1", name: "BMW 3 Series", year: 2023, price: 42500, mileage: 12500, fuel: "Petrol", transmission: "Automatic", body: "Sedan", status: "Available", image: carImages.bmw, stock: "AH-001", added: dateOffset(-2) },
    { id: "v2", name: "Mercedes-Benz C-Class", year: 2024, price: 54900, mileage: 8200, fuel: "Hybrid", transmission: "Automatic", body: "Sedan", status: "Available", image: carImages.mercedes, stock: "AH-002", added: dateOffset(-3) },
    { id: "v3", name: "Porsche 911 Carrera", year: 2023, price: 115000, mileage: 6400, fuel: "Petrol", transmission: "Automatic", body: "Coupe", status: "Reserved", image: carImages.porsche, stock: "AH-003", added: dateOffset(-4) },
    { id: "v4", name: "Audi Q8", year: 2024, price: 78500, mileage: 4100, fuel: "Diesel", transmission: "Automatic", body: "SUV", status: "Available", image: carImages.audi, stock: "AH-004", added: dateOffset(-5) },
    { id: "v5", name: "BMW 5 Series", year: 2023, price: 58900, mileage: 18000, fuel: "Hybrid", transmission: "Automatic", body: "Sedan", status: "Sold", image: carImages.bmw, stock: "AH-005", added: dateOffset(-35) },
    { id: "v6", name: "Mercedes-Benz E-Class", year: 2024, price: 68900, mileage: 5600, fuel: "Petrol", transmission: "Automatic", body: "Sedan", status: "Sold", image: carImages.mercedes, stock: "AH-006", added: dateOffset(-60) },
    { id: "v7", name: "Audi Q5", year: 2022, price: 43900, mileage: 24500, fuel: "Diesel", transmission: "Automatic", body: "SUV", status: "Sold", image: carImages.audi, stock: "AH-007", added: dateOffset(-95) },
    { id: "v8", name: "Porsche Cayenne", year: 2023, price: 92900, mileage: 14200, fuel: "Hybrid", transmission: "Automatic", body: "SUV", status: "Sold", image: carImages.porsche, stock: "AH-008", added: dateOffset(-120) },
  ],
  leads: [
    { id: "l1", name: "James Wilson", email: "james.w@example.com", phone: "+1 415 555 0181", vehicleId: "v1", stage: "New", source: "Website", created: dateOffset(0) },
    { id: "l2", name: "Sarah Johnson", email: "sarah.j@example.com", phone: "+1 415 555 0182", vehicleId: "v2", stage: "Test drive", source: "Walk-in", created: dateOffset(-1) },
    { id: "l3", name: "Michael Chen", email: "michael.c@example.com", phone: "+1 415 555 0183", vehicleId: "v3", stage: "Negotiation", source: "Referral", created: dateOffset(-2) },
    { id: "l4", name: "Emily Davis", email: "emily.d@example.com", phone: "+1 415 555 0184", vehicleId: "v4", stage: "Contacted", source: "Social media", created: dateOffset(-3) },
    { id: "l5", name: "Robert Taylor", email: "robert.t@example.com", phone: "+1 415 555 0185", vehicleId: "v5", stage: "Won", source: "Website", created: dateOffset(-8) },
    { id: "l6", name: "Olivia Brown", email: "olivia.b@example.com", phone: "+1 415 555 0186", vehicleId: "v6", stage: "Won", source: "Referral", created: dateOffset(-40) },
    { id: "l7", name: "Daniel Miller", email: "daniel.m@example.com", phone: "+1 415 555 0187", vehicleId: "v7", stage: "Won", source: "Walk-in", created: dateOffset(-70) },
    { id: "l8", name: "Sophia Anderson", email: "sophia.a@example.com", phone: "+1 415 555 0188", vehicleId: "v8", stage: "Won", source: "Website", created: dateOffset(-100) },
  ],
  appointments: [
    { id: "a1", customer: "Sarah Johnson", vehicleId: "v2", date: dateOffset(0), time: "10:30", type: "Test drive", status: "Scheduled" },
    { id: "a2", customer: "Michael Chen", vehicleId: "v3", date: dateOffset(0), time: "13:00", type: "Consultation", status: "Scheduled" },
    { id: "a3", customer: "James Wilson", vehicleId: "v1", date: dateOffset(0), time: "15:30", type: "Test drive", status: "Scheduled" },
    { id: "a4", customer: "Emily Davis", vehicleId: "v4", date: dateOffset(1), time: "11:00", type: "Test drive", status: "Scheduled" },
  ],
  sales: [
    { id: "s1", customer: "Robert Taylor", vehicleId: "v5", amount: 58900, date: dateOffset(-3), payment: "Finance" },
    { id: "s2", customer: "Olivia Brown", vehicleId: "v6", amount: 68900, date: dateOffset(-34), payment: "Bank transfer" },
    { id: "s3", customer: "Daniel Miller", vehicleId: "v7", amount: 43900, date: dateOffset(-65), payment: "Cash" },
    { id: "s4", customer: "Sophia Anderson", vehicleId: "v8", amount: 92900, date: dateOffset(-96), payment: "Finance" },
  ],
};

const KEY = "autohaus-dealer-v1";
const EVENT = "autohaus-data-change";
type Snapshot = { data: DealerData; error: string | null };
const initial: Snapshot = { data: seed, error: null };
let snapshot = initial;
let lastRaw: string | null | undefined;
function getSnapshot(): Snapshot {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === lastRaw) return snapshot;
    lastRaw = raw;
    if (!raw) return (snapshot = initial);
    const result = storeSchema.safeParse(JSON.parse(raw));
    snapshot = result.success
      ? { data: result.data, error: null }
      : { data: seed, error: "Saved workspace data is invalid. Export or recover your browser data before making changes." };
  } catch (error) {
    const message = `Unable to read browser storage: ${error instanceof Error ? error.message : "Unknown error"}`;
    if (snapshot.error !== message) snapshot = { data: seed, error: message };
  }
  return snapshot;
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}
export function useDealerData() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initial);
}
export function updateDealerData(update: (data: DealerData) => DealerData) {
  const current = getSnapshot();
  if (current.error) throw new Error(current.error);
  const next = storeSchema.parse(update(current.data));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error("Changes could not be saved. Browser storage may be full or disabled.");
  }
  window.dispatchEvent(new Event(EVENT));
}
export function money(value: number, currency = "USD", compact = false) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0, ...(compact ? { notation: "compact" as const, maximumFractionDigits: 1 } : {}) }).format(value);
}
export function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("");
}
export function exportCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((value) => {
    const text = String(value);
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  }).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
