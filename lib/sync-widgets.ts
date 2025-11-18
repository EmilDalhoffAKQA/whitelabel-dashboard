import { supabase } from "@/lib/supabase";

export async function syncWorkspaceWidgets(workspaceId: number) {
  const { data: widgetTypes } = await supabase
    .from("widget_types")
    .select("*")
    .eq("is_active", true);

  if (!widgetTypes) return;

  const { data: existingLayouts } = await supabase
    .from("workspace_widget_layouts")
    .select("widget_type_id")
    .eq("workspace_id", workspaceId);

  const existingWidgetIds = new Set(
    existingLayouts?.map((l) => l.widget_type_id) || []
  );

  const missingWidgets = widgetTypes.filter(
    (wt) => !existingWidgetIds.has(wt.id)
  );

  if (missingWidgets.length === 0) return;

  const { data: maxY } = await supabase
    .from("workspace_widget_layouts")
    .select("y_position")
    .eq("workspace_id", workspaceId)
    .order("y_position", { ascending: false })
    .limit(1)
    .single();

  let nextY = (maxY?.y_position || 0) + 2;

  const newLayouts = missingWidgets.map((widget) => ({
    workspace_id: workspaceId,
    widget_type_id: widget.id,
    x_position: 0,
    y_position: nextY++,
    width: widget.width,
    height: widget.height,
    is_visible: false,
  }));

  await supabase.from("workspace_widget_layouts").insert(newLayouts);
}
