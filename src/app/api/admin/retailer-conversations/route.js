import { NextResponse } from "next/server";

const CONVERSATIONS_READER_URL =
  "https://script.google.com/macros/s/AKfycbwEuQP9DHVhzGedXApU-qkvLav37w3zdZtEnp8QjnX2DcHn-bwdsdmaRcHs5xefk8W2sA/exec";

export async function GET() {
  try {
    const res = await fetch(CONVERSATIONS_READER_URL, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Retailer Conversations API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.retailerId || !body.message) {
      return NextResponse.json(
        { success: false, message: "retailerId and message are required" },
        { status: 400 }
      );
    }

    const res = await fetch(CONVERSATIONS_READER_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { success: false, message: "Invalid response from Google Apps Script", raw: text };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Retailer Conversations POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save conversation" },
      { status: 500 }
    );
  }
}
