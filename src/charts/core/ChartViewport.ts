import { ViewportRange } from '../../types/chart';

/**
 * Authoritative ChartViewport Engine 2.0 (TypeScript)
 * Manages visible slicing, viewport bounds, zooming with focal-point preservation, and pan clamping
 */
export class ChartViewport {
  readonly totalDataLength: number;
  readonly zoomLevel: number;
  readonly panOffset: number;

  constructor(totalDataLength = 1, zoomLevel = 1.0, panOffset = 0) {
    this.totalDataLength = Math.max(1, totalDataLength);
    this.zoomLevel = Math.max(1.0, Math.min(20.0, isNaN(zoomLevel) ? 1.0 : zoomLevel));
    this.panOffset = Math.max(0, isNaN(panOffset) ? 0 : panOffset);
  }

  getVisibleRange(): ViewportRange {
    const visibleCount = Math.max(2, Math.floor(this.totalDataLength / this.zoomLevel));
    const maxPan = Math.max(0, this.totalDataLength - visibleCount);
    const startIdx = Math.max(0, Math.min(maxPan, Math.floor(this.panOffset)));
    const endIdx = Math.min(this.totalDataLength, startIdx + visibleCount);

    return {
      startIdx,
      endIdx,
      visibleCount: endIdx - startIdx
    };
  }

  /**
   * Focal-point Zoom: Zooms around a specific focal bar index (e.g. cursor focus)
   */
  zoomAtFocalIndex(factor: number, focalIdx: number | null = null): ChartViewport {
    const currentRange = this.getVisibleRange();
    const focus = focalIdx !== null ? focalIdx : Math.floor(currentRange.startIdx + currentRange.visibleCount / 2);

    const newZoom = Math.max(1.0, Math.min(20.0, this.zoomLevel * factor));
    const newVisibleCount = Math.max(2, Math.floor(this.totalDataLength / newZoom));

    // Preserve focal ratio
    const focalRatio = currentRange.visibleCount > 0 ? (focus - currentRange.startIdx) / currentRange.visibleCount : 0.5;
    let newStart = focus - Math.floor(focalRatio * newVisibleCount);

    const maxPan = Math.max(0, this.totalDataLength - newVisibleCount);
    newStart = Math.max(0, Math.min(maxPan, newStart));

    return new ChartViewport(this.totalDataLength, newZoom, newStart);
  }

  pan(deltaBars: number): ChartViewport {
    const currentRange = this.getVisibleRange();
    const maxPan = Math.max(0, this.totalDataLength - currentRange.visibleCount);
    const newPan = Math.max(0, Math.min(maxPan, this.panOffset + deltaBars));
    return new ChartViewport(this.totalDataLength, this.zoomLevel, newPan);
  }

  reset(): ChartViewport {
    return new ChartViewport(this.totalDataLength, 1.0, 0);
  }
}
