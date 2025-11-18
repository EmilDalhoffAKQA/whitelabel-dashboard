import { Layout } from "react-grid-layout";
import { WorkspaceWidgetLayout } from "./types";

export function widgetsToLayout(widgets: WorkspaceWidgetLayout[]): Layout[] {
  return widgets
    .filter((w) => w.is_visible)
    .map((widget) => ({
      i: widget.id,
      x: widget.x_position,
      y: widget.y_position,
      w: widget.width,
      h: widget.height,
      minW: 2,
      minH: 2,
      maxW: 12,
      static: false,
    }));
}

export function layoutToUpdates(layout: Layout[]): Array<{
  id: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
}> {
  return layout.map((item) => ({
    id: item.i,
    x_position: item.x,
    y_position: item.y,
    width: item.w,
    height: item.h,
  }));
}

export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 180, // Match original CSS Grid base unit (180px)
  margin: [16, 16] as [number, number],
  containerPadding: [0, 0] as [number, number], // Remove padding to match original
  compactType: null as any, // Don't auto-compact, respect exact positions
};
