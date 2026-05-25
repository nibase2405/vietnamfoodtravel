import Link from "next/link";
import type { MapMarker } from "@/types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function popupHtml(marker: MapMarker) {
  const title = escapeHtml(marker.title);
  const subtitle = escapeHtml(marker.subtitle ?? "");
  const href = marker.href
    ? `<a href="${escapeHtml(marker.href)}" class="text-sm font-semibold hover:underline">${title}</a>`
    : `<div class="text-sm font-semibold">${title}</div>`;
  return `<div class="min-w-44 p-3">${href}<div class="mt-1 text-xs text-muted-foreground">${subtitle}</div></div>`;
}

export function MapMarkerPopup({ marker }: { marker: MapMarker }) {
  return (
    <div className="p-3">
      {marker.href ? (
        <Link href={marker.href} className="font-semibold">
          {marker.title}
        </Link>
      ) : (
        <div className="font-semibold">{marker.title}</div>
      )}
      {marker.subtitle ? <div className="mt-1 text-sm text-muted-foreground">{marker.subtitle}</div> : null}
    </div>
  );
}
