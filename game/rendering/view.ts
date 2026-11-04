export const CAMERA_SECTOR = 240;
export type ViewWindow = { start: number; end: number };
export function viewWindow(sector: number, worldWidth: number): ViewWindow {
  const anchor = Math.max(0, Math.floor(sector)) * CAMERA_SECTOR;
  return {
    start: Math.max(0, anchor - CAMERA_SECTOR),
    end: Math.min(worldWidth, anchor + 960),
  };
}
export function intersects(window: ViewWindow, x: number, width = 0) {
  return x + width >= window.start && x <= window.end;
}
/** Clip individual ground tiles, rather than drawing an entire long segment. */
export function groundTiles(
  segment: { x: number; w: number },
  window: ViewWindow,
  tileWidth = 240,
) {
  const first = Math.floor(Math.max(segment.x, window.start) / tileWidth),
    end = Math.ceil(Math.min(segment.x + segment.w, window.end) / tileWidth);
  return Array.from({ length: Math.max(0, end - first) }, (_, i) => first + i);
}
