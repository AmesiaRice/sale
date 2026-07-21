import { NextResponse } from "next/server";

const RETAILERS_READER_URL = "https://script.google.com/macros/s/AKfycbx045oOHjN0emHLCSDwXpNkxQxFWRDo3V1OrGr6r-lpORzDvjECJGxFxv2NkyXu2kffBg/exec";

export async function GET() {
  try {
    const res = await fetch(RETAILERS_READER_URL, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Retailers API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch retailers" },
      { status: 500 }
    );
  }
}