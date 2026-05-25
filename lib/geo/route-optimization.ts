export type RoutePoint = {
  id: string;
  title?: string;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
};

export type OptimizedRoutePoint<T extends RoutePoint> = T & {
  distance_from_previous_km: number;
  travel_time_minutes: number;
};

const averageSpeedByTransport: Record<string, number> = {
  walking: 4,
  walk: 4,
  bus: 18,
  public: 18,
  scooter: 22,
  motorbike: 22,
  grab: 24,
  taxi: 24,
  car: 24,
  default: 20
};

function toRadians(value: number) {
  return value * Math.PI / 180;
}

export function hasRouteCoordinates(point: RoutePoint): point is RoutePoint & { latitude: number; longitude: number } {
  return typeof point.latitude === "number" && typeof point.longitude === "number";
}

export function haversineDistanceKm(a: RoutePoint, b: RoutePoint) {
  if (!hasRouteCoordinates(a) || !hasRouteCoordinates(b)) return 0;

  const earthRadiusKm = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function estimateTravelTimeMinutes(distanceKm: number, transport: string) {
  const normalized = transport.toLowerCase();
  const speed =
    Object.entries(averageSpeedByTransport).find(([keyword]) => normalized.includes(keyword))?.[1] ??
    averageSpeedByTransport.default;
  return Math.max(8, Math.round((distanceKm / speed) * 60) + 5);
}

export function optimizeRoute<T extends RoutePoint>(
  points: T[],
  options: { start?: RoutePoint; transport?: string } = {}
): Array<OptimizedRoutePoint<T>> {
  const transport = options.transport ?? "grab";
  const remaining = points.filter(hasRouteCoordinates) as Array<T & { latitude: number; longitude: number }>;
  const optimized: Array<OptimizedRoutePoint<T>> = [];
  let current: RoutePoint | undefined = options.start && hasRouteCoordinates(options.start) ? options.start : remaining[0];

  while (remaining.length && current) {
    let nextIndex = 0;
    let nextDistance = Number.POSITIVE_INFINITY;

    remaining.forEach((point, index) => {
      const distance = haversineDistanceKm(current!, point);
      if (distance < nextDistance) {
        nextDistance = distance;
        nextIndex = index;
      }
    });

    const [next] = remaining.splice(nextIndex, 1);
    optimized.push({
      ...next,
      distance_from_previous_km: Number.isFinite(nextDistance) ? Number(nextDistance.toFixed(1)) : 0,
      travel_time_minutes: estimateTravelTimeMinutes(Number.isFinite(nextDistance) ? nextDistance : 0, transport)
    });
    current = next;
  }

  return optimized;
}
