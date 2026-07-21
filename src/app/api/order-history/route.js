// app/api/order-history/route.js
// Order History Reader Apps Script ko wrap karta hai.

import { NextResponse } from "next/server";

const ORDER_HISTORY_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwi1xDTvZ6NW3Jdoogd7pve94LvCCxjcVv83DhjbLq0RqEofPyAXXsgPSV6pwvVBC6AEA/exec";

export const maxDuration = 30; // seconds (Vercel cold-start ke liye)

export async function GET(req) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const { searchParams } = new URL(req.url);
    const retailerId = searchParams.get("retailerId");
    const orderId = searchParams.get("orderId");

    if (!retailerId && !orderId) {
      return NextResponse.json(
        { success: false, message: "retailerId or orderId is required" },
        { status: 400 }
      );
    }

    // Query string banayein — jo bhi diya gaya ho wahi forward karein
    const params = new URLSearchParams();
    if (retailerId) params.set("retailerId", retailerId);
    if (orderId) params.set("orderId", orderId);

    const url = `${ORDER_HISTORY_APPS_SCRIPT_URL}?${params.toString()}`;
  console.log(url)
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
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
    console.error("Order History API Error:", error);

    const isAbort = error?.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: isAbort ? "Request to Apps Script timed out" : error.message || "Request failed",
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}