// API: POST demo order
// ⚠️  DEMO MODE — saves to local JSON file. No real payment processed.
import { NextResponse } from "next/server";
import { saveOrder, type DemoOrder } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order: DemoOrder = {
      id: `order-${Date.now()}`,
      items: body.items ?? [],
      total: body.total ?? 0,
      name: body.name ?? "",
      address: body.address ?? "",
      paymentMethod: body.paymentMethod ?? "",
      createdAt: new Date().toISOString(),
      status: "demo-pending",
    };
    saveOrder(order);
    return NextResponse.json({ success: true, demo: true, orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
