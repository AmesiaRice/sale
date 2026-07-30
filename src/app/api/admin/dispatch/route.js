import { NextResponse } from "next/server";

const DISPATCH_API_URL = "https://script.google.com/macros/s/AKfycbzbyeNS4eq5CjPIvAIMgBTrkDrjfeNZWH6G6Jht7xHp57_A3_cK-JgpkgCl0CWgJTSYbA/exec"; 

export async function GET() {
  if (!DISPATCH_API_URL) {
    return NextResponse.json({ success: true, rows: [] });
  }

  try {
    const res = await fetch(DISPATCH_API_URL, {
      redirect: "follow",
      cache: "no-store",
    });
    const result = JSON.parse(await res.text());
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!DISPATCH_API_URL) {
    return NextResponse.json({ success: false, message: "Dispatch API abhi deploy nahi hui hai" }, { status: 503 });
  }

  try {
    const body = await req.json();

    const res = await fetch(DISPATCH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
    });
    const result = JSON.parse(await res.text());
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
