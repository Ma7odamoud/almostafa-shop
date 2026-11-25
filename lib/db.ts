// ============================================================
// Demo Database — file-based JSON store (DEMO MODE)
// ⚠️  This is a simple file-based store for DEMO purposes only.
// Products are saved to a JSON file on disk.
// For production, replace with a real database (e.g. PostgreSQL, MongoDB, Supabase).
// ============================================================

import fs from "fs";
import path from "path";
import { Fabric, demoFabrics } from "./demoData";

const DB_PATH = path.join(process.cwd(), "data", "fabrics.json");

function ensureDb(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(demoFabrics, null, 2), "utf-8");
  }
}

export function getAllFabrics(): Fabric[] {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as Fabric[];
}

export function getPublicFabrics(): Fabric[] {
  return getAllFabrics().filter((f) => !f.hidden);
}

export function getFabricById(id: string): Fabric | undefined {
  return getAllFabrics().find((f) => f.id === id);
}

export function saveFabric(fabric: Fabric): void {
  ensureDb();
  const all = getAllFabrics();
  const idx = all.findIndex((f) => f.id === fabric.id);
  if (idx >= 0) all[idx] = fabric;
  else all.push(fabric);
  fs.writeFileSync(DB_PATH, JSON.stringify(all, null, 2), "utf-8");
}

export function deleteFabric(id: string): void {
  ensureDb();
  const all = getAllFabrics().filter((f) => f.id !== id);
  fs.writeFileSync(DB_PATH, JSON.stringify(all, null, 2), "utf-8");
}

// ============================================================
// Orders store (demo)
// ============================================================

export interface DemoOrder {
  id: string;
  items: { fabricId: string; fabricName: string; meters: number; pricePerMeter: number }[];
  total: number;
  name: string;
  address: string;
  paymentMethod: string;
  createdAt: string;
  status: "demo-pending";
}

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

export function saveOrder(order: DemoOrder): void {
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let all: DemoOrder[] = [];
  if (fs.existsSync(ORDERS_PATH)) {
    all = JSON.parse(fs.readFileSync(ORDERS_PATH, "utf-8"));
  }
  all.push(order);
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(all, null, 2), "utf-8");
}

export function getAllOrders(): DemoOrder[] {
  if (!fs.existsSync(ORDERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(ORDERS_PATH, "utf-8"));
}
