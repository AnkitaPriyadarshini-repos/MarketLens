/**
 * ChartViewport Engine 2.0
 * Manages chart view window, visible data slice, zooming, panning, and canvas layout metrics
 */

export class ChartViewport {
  constructor(totalDataLength, zoomLevel = 1.0, panOffset = 0) {
    this.totalDataLength = totalDataLength || 1;
    this.zoomLevel = Math.max(1.0, Math.min(10.0, zoomLevel));
    this.panOffset = panOffset;
  }

  getVisibleRange() {
    const visibleCount = Math.max(5, Math.floor(this.totalDataLength / this.zoomLevel));
    const maxStart = Math.max(0, this.totalDataLength - visibleCount);
    const startIdx = Math.max(0, Math.min(maxStart, Math.floor(this.panOffset)));
    const endIdx = Math.min(this.totalDataLength, startIdx + visibleCount);

    return {
      startIdx,
      endIdx,
      visibleCount: endIdx - startIdx
    };
  }

  zoom(factor) {
    const newZoom = Math.max(1.0, Math.min(10.0, this.zoomLevel * factor));
    return new ChartViewport(this.totalDataLength, newZoom, this.panOffset);
  }

  pan(deltaBars) {
    const newPan = Math.max(0, this.panOffset + deltaBars);
    return new ChartViewport(this.totalDataLength, this.zoomLevel, newPan);
  }

  reset() {
    return new ChartViewport(this.totalDataLength, 1.0, 0);
  }
}
