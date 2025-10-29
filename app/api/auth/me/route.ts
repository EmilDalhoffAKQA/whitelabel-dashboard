import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get("user_info");

  if (!userInfoCookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const userInfo = JSON.parse(userInfoCookie.value);
    return NextResponse.json({ user: userInfo });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
