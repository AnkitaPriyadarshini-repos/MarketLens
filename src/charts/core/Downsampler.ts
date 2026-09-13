import { OHLCPoint } from '../../types/chart';

/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm (TypeScript)
 * High-performance downsampling for large financial datasets (1k - 100k+ data points)
 */
export function lttbDownsample(data: OHLCPoint[], threshold: number): OHLCPoint[] {
  if (!data || !Array.isArray(data) || data.length === 0 || threshold >= data.length || threshold <= 2) {
    return data || [];
  }

  const sampled: OHLCPoint[] = [];
  const dataLength = data.length;

  const bucketSize = (dataLength - 2) / (threshold - 2);

  let a = 0;
  sampled.push(data[a]);

  for (let i = 0; i < threshold - 2; i++) {
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    let avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += avgRangeStart;
      avgY += data[avgRangeStart]?.price || data[avgRangeStart]?.close || 0;
    }
    avgX /= (avgRangeLength || 1);
    avgY /= (avgRangeLength || 1);

    let rangeOffs = Math.floor((i + 0) * bucketSize) + 1;
    let rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    const pointAX = a;
    const pointAY = data[a]?.price || data[a]?.close || 0;

    let maxArea = -1;
    let maxAreaPoint = rangeOffs;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      const currentY = data[rangeOffs]?.price || data[rangeOffs]?.close || 0;
      const area = Math.abs(
        (pointAX - avgX) * (currentY - pointAY) -
        (pointAX - rangeOffs) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = rangeOffs;
      }
    }

    if (data[maxAreaPoint]) {
      sampled.push(data[maxAreaPoint]);
      a = maxAreaPoint;
    }
  }

  if (data[dataLength - 1]) {
    sampled.push(data[dataLength - 1]);
  }

  return sampled;
}
