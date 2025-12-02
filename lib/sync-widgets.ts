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

  const { data: visibleLayouts } = await supabase
    .from("workspace_widget_layouts")
    .select("x_position, y_position, width, height")
    .eq("workspace_id", workspaceId)
    .eq("is_visible", true)
    .order("y_position", { ascending: false });

  // Find the max Y position from visible widgets only
  let nextY = visibleLayouts && visibleLayouts.length > 0 
    ? Math.max(...visibleLayouts.map(l => l.y_position + l.height))
    : 0;

  const COLS = 12;
  let currentX = 0;
  let currentRowY = nextY;

  const newLayouts = missingWidgets.map((widget) => {
    const widgetWidth = widget.width;
    
    // Check if widget fits in current row
    if (currentX + widgetWidth > COLS) {
      // Move to next row
      currentX = 0;
      currentRowY += widget.height;
    }

    const layout = {
      workspace_id: workspaceId,
      widget_type_id: widget.id,
      x_position: currentX,
      y_position: currentRowY,
      width: widget.width,
      height: widget.height,
      is_visible: false,
    };

    // Update position for next widget
    currentX += widgetWidth;

    return layout;
  });

  await supabase.from("workspace_widget_layouts").insert(newLayouts);
}
