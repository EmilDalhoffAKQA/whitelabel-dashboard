import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/workspace/create
// Body: { orgName: string, user: { email: string, name: string } }
export async function POST(req: NextRequest) {
  try {
    const { orgName, user } = await req.json();
    if (!orgName || !user?.email) {
      return NextResponse.json(
        { error: "Missing orgName or user info" },
        { status: 400 }
      );
    }

    // 1. Create org (workspace) in Supabase
    const { data: workspace, error: wsError } = await supabaseAdmin
      .from("workspaces")
      .insert({ name: orgName })
      .select()
      .single();
    if (wsError || !workspace) {
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    // 2. Upsert user in Supabase
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from("users")
      .upsert({ email: user.email, name: user.name || user.email })
      .select()
      .single();
    if (userError || !dbUser) {
      return NextResponse.json(
        { error: "Failed to upsert user" },
        { status: 500 }
      );
    }

    // 3. Add user to workspace as admin
    const { error: uwError } = await supabaseAdmin
      .from("user_workspaces")
      .upsert({
        user_id: dbUser.id,
        workspace_id: workspace.id,
        role: "admin",
      });
    if (uwError) {
      return NextResponse.json(
        { error: "Failed to add user to workspace" },
        { status: 500 }
      );
    }

    // (Optional) 4. Create org in Auth0 via Management API (not implemented here)
    // (Optional) 5. Create user in Auth0 if not exists (handled in invite step)

    return NextResponse.json({ workspace, user: dbUser });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Server error: ${e.message}` },
      { status: 500 }
    );
  }
}
