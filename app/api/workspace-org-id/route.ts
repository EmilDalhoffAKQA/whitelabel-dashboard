import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceByIdentifier } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  const workspace = req.nextUrl.searchParams.get("workspace");
  if (!workspace) {
    return NextResponse.json({ error: "Missing workspace" }, { status: 400 });
  }
  try {
    const data = await getWorkspaceByIdentifier(workspace);
    return NextResponse.json({ orgId: data.auth0_org_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
