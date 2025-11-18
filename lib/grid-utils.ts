import { Layout } from "react-grid-layout";
import { WorkspaceWidgetLayout } from "./types";

export function widgetsToLayout(widgets: WorkspaceWidgetLayout[]): Layout[] {
  const COLS = 12;

  return widgets
    .filter((w) => w.is_visible)
    .map((widget) => {
      // Ensure widget stays within horizontal bounds
      const width = Math.min(widget.width, COLS);
      const x = Math.max(0, Math.min(widget.x_position, COLS - width));
      const y = Math.max(0, widget.y_position);

      return {
        i: widget.id,
        x: x,
        y: y,
        w: width,
        h: widget.height,
        minW: 2,
        minH: 1,
        maxW: COLS,
        static: false,
      };
    });
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
  preventCollision: false, // Allow overlapping during drag
  allowOverlap: true, // Explicitly allow overlap
};

// Snap positions based on widget width
// Small widgets (3-wide): snap to 0, 3, 6, 9
// Medium widgets (6-wide): snap to 0, 6
// Large widgets (12-wide): snap to 0 only
export function snapToGrid(x: number, width: number): number {
  if (width === 12) {
    // Large widgets: only position 0
    return 0;
  } else if (width === 6) {
    // Medium widgets: snap to 0 or 6
    return x < 6 ? 0 : 6;
  } else if (width === 3) {
    // Small widgets: snap to 0, 3, 6, or 9
    const snapPoints = [0, 3, 6, 9];
    return snapPoints.reduce((prev, curr) =>
      Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
    );
  } else if (width === 4) {
    // 4-wide widgets: snap to 0, 4, 8
    const snapPoints = [0, 4, 8];
    return snapPoints.reduce((prev, curr) =>
      Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
    );
  }

  // Default: no snapping
  return x;
}
