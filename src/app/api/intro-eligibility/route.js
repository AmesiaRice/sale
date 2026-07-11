import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaJ32zgutjosdLzqWjkYg9Qaa5sRZf-Fuo6g-G7Ie9xKPhe_UQQVxvwjqIdHUCMnemUA/exec"; // same Orders script URL

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const retailerId = searchParams.get("retailerId");

    if (!retailerId) {
      return NextResponse.json({ success: false, message: "retailerId is required" }, { status: 400 });
    }

    const url = `${APPS_SCRIPT_URL}?retailerId=${encodeURIComponent(retailerId)}&sheetName=Orders`;

    const res = await fetch(url, { method: "GET", redirect: "follow", cache: "no-store" });
    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { success: false, message: "Invalid response from Apps Script" };
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}