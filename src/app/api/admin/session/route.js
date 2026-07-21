import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ success: false, message: "Not logged in" });
    }

    const admin = JSON.parse(sessionCookie.value);

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid session" });
  }
}