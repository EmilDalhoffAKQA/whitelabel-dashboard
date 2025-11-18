import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { workspaceId, layouts } = body;

    if (!workspaceId || !layouts) {
      return NextResponse.json(
        { error: "Missing workspaceId or layouts" },
        { status: 400 }
      );
    }

    // Update each widget layout
    const updates = layouts.map((layout: any) =>
      supabase
        .from("workspace_widget_layouts")
        .update({
          x_position: layout.x_position,
          y_position: layout.y_position,
          width: layout.width,
          height: layout.height,
          updated_at: new Date().toISOString(),
        })
        .eq("id", layout.id)
        .eq("workspace_id", workspaceId)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving layout:", error);
    return NextResponse.json(
      { error: "Failed to save layout" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workspace_widget_layouts")
      .select(
        `
        *,
        widget_type:widget_types(*)
      `
      )
      .eq("workspace_id", workspaceId)
      .eq("is_visible", true);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch layout" },
      { status: 500 }
    );
  }
}
