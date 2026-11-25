// API: GET all public fabrics
import { NextResponse } from "next/server";
import { getPublicFabrics } from "@/lib/db";

export async function GET() {
  try {
    const fabrics = getPublicFabrics();
    return NextResponse.json(fabrics);
  } catch {
    return NextResponse.json({ error: "Failed to load fabrics" }, { status: 500 });
  }
}
