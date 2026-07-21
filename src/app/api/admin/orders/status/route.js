import { NextResponse } from "next/server";

const ORDER_STATUS_UPDATER_URL = "https://script.google.com/macros/s/AKfycbyKShF62PvqwYRQnIhhzIaWEhQB3kxTOAn3f9cpMIHpaU4vpS10kVuRerHg3Fxs-IMLbQ/exec";

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "orderId and status are required" },
        { status: 400 }
      );
    }

    const res = await fetch(ORDER_STATUS_UPDATER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update status" },
      { status: 500 }
    );
  }
}