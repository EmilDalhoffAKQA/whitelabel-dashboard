import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/user/[email]/workspaces
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // Find user by email
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (userError || !user) {
    return NextResponse.json({ workspaces: [] });
  }

  // Get workspaces for user
  const { data: userWorkspaces, error: uwError } = await supabaseAdmin
    .from("user_workspaces")
    .select("role, workspace:workspaces(id, name)")
    .eq("user_id", user.id);

  if (uwError) {
    return NextResponse.json({ workspaces: [] });
  }

  const workspaces = (userWorkspaces || []).map((uw: any) => ({
    id: uw.workspace.id,
    name: uw.workspace.name,
    role: uw.role,
  }));

  return NextResponse.json({ workspaces });
}
