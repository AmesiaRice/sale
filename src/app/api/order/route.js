// app/api/order/route.js
// Forwards orders to Google Apps Script Web App.
// Apps Script may return a 302 redirect — fetch follows it automatically.

import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaJ32zgutjosdLzqWjkYg9Qaa5sRZf-Fuo6g-G7Ie9xKPhe_UQQVxvwjqIdHUCMnemUA/exec";

// Apps Script can be slow on cold start — give it room.
export const maxDuration = 30; // seconds (Vercel)

export async function POST(req) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s

  try {
    const body = await req.json();
    console.log("Order batch received:", Array.isArray(body) ? body.length : 1);

    // Normalize to array for batch sending
    const orderData = Array.isArray(body) ? body : [body];

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetName: "Orders", data: orderData }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const text = await response.text();

    if (!response.ok) {
      console.error("Apps Script HTTP error:", response.status, text);
      return NextResponse.json(
        {
          success: false,
          message: `Apps Script responded with status ${response.status}`,
          raw: text,
        },
        { status: 502 }
      );
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        success: false,
        message: "Invalid (non-JSON) response from Apps Script",
        raw: text,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Order API Error:", error);

    const isAbort = error?.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: isAbort
          ? "Request to Apps Script timed out"
          : error.message || "Request failed",
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}
