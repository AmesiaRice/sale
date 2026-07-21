import { NextResponse } from "next/server";

const ENQUIRIES_READER_URL = "https://script.google.com/macros/s/AKfycbyJazooz3l6aSy6u4jOi6p-9ubZGcELjoah-973pv6IkAgJjmi6GOEmjVb9kdatKHUL/exec";

export async function GET() {
  try {
    const res = await fetch(ENQUIRIES_READER_URL, {
      redirect: "follow",
      cache: "no-store",
    });
    const result = JSON.parse(await res.text());
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Enquiries API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}