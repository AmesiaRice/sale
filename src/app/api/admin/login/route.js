import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_AUTH_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSBLGoFtqTF-nIvG-5uuQWMNKg0gRLZCeQ9AE3m_Kdhay_gPAK0xLEF3EnE5b60xBw/exec";

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: "Phone and password are required" },
        { status: 400 }
      );
    }

    const res = await fetch(ADMIN_AUTH_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await res.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid response from auth server" },
        { status: 502 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Session cookie mein admin ka data store karo (httpOnly — JS se access nahi ho sakta, XSS-safe)
    const sessionData = JSON.stringify(result.admin);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 din
    });

    return NextResponse.json({ success: true, admin: result.admin });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}