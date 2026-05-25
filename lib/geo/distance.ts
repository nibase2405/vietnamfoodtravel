export type Coordinates = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
};

export function hasCoordinates(value: Coordinates): value is { latitude: number; longitude: number } {
  return typeof value.latitude === "number" && typeof value.longitude === "number" && Number.isFinite(value.latitude) && Number.isFinite(value.longitude);
}

export function distanceKm(from: Coordinates, to: Coordinates) {
  if (!hasCoordinates(from) || !hasCoordinates(to)) return null;

  const earthRadiusKm = 6371;
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
