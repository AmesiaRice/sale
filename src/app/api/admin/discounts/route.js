import { NextResponse } from "next/server";

const DISCOUNTS_ADMIN_URL = "https://script.google.com/macros/s/AKfycbxZO_tioXKu1SODD-RWADkAwQUwYaW-UDXvAhSAYqqjeUlMpZ7shbwqAyRiWdgFv78M/exec";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const res = await fetch(`${DISCOUNTS_ADMIN_URL}?type=${type}`, {
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
  try {
    const body = await req.json();

    const res = await fetch(DISCOUNTS_ADMIN_URL, {
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