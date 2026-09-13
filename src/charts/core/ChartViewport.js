/**
 * Authoritative ChartViewport Engine 2.0
 * Manages visible slicing, viewport bounds, zooming with focal-point preservation, and pan clamping
 */

export class ChartViewport {
  constructor(totalDataLength = 1, zoomLevel = 1.0, panOffset = 0) {
    this.totalDataLength = Math.max(1, totalDataLength);
    this.zoomLevel = Math.max(1.0, Math.min(20.0, zoomLevel));
    this.panOffset = Math.max(0, panOffset);
  }

  getVisibleRange() {
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
  zoomAtFocalIndex(factor, focalIdx = null) {
    const currentRange = this.getVisibleRange();
    const focus = focalIdx !== null ? focalIdx : Math.floor(currentRange.startIdx + currentRange.visibleCount / 2);

    const newZoom = Math.max(1.0, Math.min(20.0, this.zoomLevel * factor));
    const newVisibleCount = Math.max(2, Math.floor(this.totalDataLength / newZoom));

    // Preserve focal ratio
    const focalRatio = (focus - currentRange.startIdx) / currentRange.visibleCount;
    let newStart = focus - Math.floor(focalRatio * newVisibleCount);

    const maxPan = Math.max(0, this.totalDataLength - newVisibleCount);
    newStart = Math.max(0, Math.min(maxPan, newStart));

    return new ChartViewport(this.totalDataLength, newZoom, newStart);
  }

  pan(deltaBars) {
    const currentRange = this.getVisibleRange();
    const maxPan = Math.max(0, this.totalDataLength - currentRange.visibleCount);
    const newPan = Math.max(0, Math.min(maxPan, this.panOffset + deltaBars));
    return new ChartViewport(this.totalDataLength, this.zoomLevel, newPan);
  }

  reset() {
    return new ChartViewport(this.totalDataLength, 1.0, 0);
  }
}
