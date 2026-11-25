// API: GET single fabric by id
import { NextResponse } from "next/server";
import { getFabricById } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fabric = getFabricById(id);
  if (!fabric || fabric.hidden) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(fabric);
}
