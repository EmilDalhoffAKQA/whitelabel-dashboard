import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/user/link-workspace
// Body: { email: string, workspaceId: number }
export async function POST(req: NextRequest) {
  try {
    const { email, workspaceId } = await req.json();

    if (!email || !workspaceId) {
      return NextResponse.json(
        { error: "Missing email or workspaceId" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Link user to workspace
    const { data, error } = await supabaseAdmin
      .from("user_workspaces")
      .upsert(
        {
          user_id: user.id,
          workspace_id: workspaceId,
          role: "admin",
        },
        {
          onConflict: "user_id,workspace_id",
        }
      )
      .select();

    if (error) {
      console.error("Error linking user to workspace:", error);
      return NextResponse.json(
        { error: "Failed to link user to workspace" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User linked to workspace successfully",
      data,
    });
  } catch (error: any) {
    console.error("Link workspace error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
