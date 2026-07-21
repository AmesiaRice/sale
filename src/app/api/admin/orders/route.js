import { NextResponse } from "next/server";

const ORDER_HISTORY_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwi1xDTvZ6NW3Jdoogd7pve94LvCCxjcVv83DhjbLq0RqEofPyAXXsgPSV6pwvVBC6AEA/exec";

export async function GET() {
  try {
    const res = await fetch(`${ORDER_HISTORY_APPS_SCRIPT_URL}?mode=all`, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Non-JSON response from Apps Script:", text);
      return NextResponse.json(
        { success: false, message: "Invalid response from Apps Script", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin Orders API Error:", error); // 👈 terminal mein poora error dikhega
    return NextResponse.json(
      { success: false, message: error.message || "Request failed" },
      { status: 500 }
    );
  }
}