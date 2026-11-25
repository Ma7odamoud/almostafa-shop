// API: Admin — CRUD for fabrics (requires admin session)
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllFabrics, saveFabric, deleteFabric } from "@/lib/db";
import type { Fabric } from "@/lib/demoData";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// GET all fabrics (including hidden)
export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  return NextResponse.json(getAllFabrics());
}

// POST — create or update a fabric
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const fabric = await req.json() as Fabric;
    if (!fabric.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    saveFabric(fabric);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// DELETE — delete a fabric
export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteFabric(id);
  return NextResponse.json({ success: true });
}
