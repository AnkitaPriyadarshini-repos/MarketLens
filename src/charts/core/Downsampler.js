/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm
 * High-performance downsampling for large financial datasets (10k-100k+ data points)
 */

export function lttbDownsample(data, threshold) {
  if (!data || data.length === 0 || threshold >= data.length || threshold <= 2) {
    return data || [];
  }

  const sampled = [];
  const dataLength = data.length;

  // Bucket size. Leave room for start and end data points
  const bucketSize = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially the first point
  sampled.push(data[a]);

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (bucket B)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    let avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += avgRangeStart;
      avgY += data[avgRangeStart].price || data[avgRangeStart].close || 0;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for current bucket (bucket A)
    let rangeOffs = Math.floor((i + 0) * bucketSize) + 1;
    let rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    // Point a
    const pointAX = a;
    const pointAY = data[a].price || data[a].close || 0;

    let maxArea = -1;
    let maxAreaPoint = rangeOffs;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      const currentY = data[rangeOffs].price || data[rangeOffs].close || 0;
      // Calculate triangle area over three buckets
      const area = Math.abs(
        (pointAX - avgX) * (currentY - pointAY) -
        (pointAX - rangeOffs) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = rangeOffs;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint; // Next bucket's previous point is current bucket's selected point
  }

  sampled.push(data[dataLength - 1]); // Always add the last point

  return sampled;
}
