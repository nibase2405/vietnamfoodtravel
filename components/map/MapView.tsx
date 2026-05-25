"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation, Sparkles } from "lucide-react";
import { mapboxToken, vietnamBounds } from "@/lib/mapbox/config";
import { popupHtml } from "@/components/map/MapMarkerPopup";
import { type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import type { MapMarker } from "@/types";

type MapboxModule = typeof import("mapbox-gl")["default"];
type MapInstance = import("mapbox-gl").Map;
type MarkerInstance = import("mapbox-gl").Marker;
const fallbackLabels: Record<SupportedLocale, { demo: string; token: string; directions: string }> = {
  "zh-tw": { demo: "示範地圖", token: "設定 NEXT_PUBLIC_MAPBOX_TOKEN 後會啟用 Mapbox 互動地圖", directions: "點擊餐廳可開啟 Google Maps 導航" },
  "zh-cn": { demo: "示范地图", token: "设置 NEXT_PUBLIC_MAPBOX_TOKEN 后会启用 Mapbox 互动地图", directions: "点击餐厅可开启 Google Maps 导航" },
  en: { demo: "Demo map", token: "Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the interactive Mapbox map", directions: "Click a restaurant to open Google Maps directions" },
  vi: { demo: "Bản đồ demo", token: "Cài NEXT_PUBLIC_MAPBOX_TOKEN để bật bản đồ Mapbox tương tác", directions: "Bấm nhà hàng để mở chỉ đường Google Maps" },
  ko: { demo: "데모 지도", token: "NEXT_PUBLIC_MAPBOX_TOKEN을 설정하면 Mapbox 인터랙티브 지도가 활성화됩니다", directions: "식당을 클릭하면 Google Maps 길찾기가 열립니다" },
  ja: { demo: "デモ地図", token: "NEXT_PUBLIC_MAPBOX_TOKEN を設定すると Mapbox のインタラクティブ地図が有効になります", directions: "レストランをクリックすると Google Maps のルート案内を開けます" }
};

export function MapView({
  markers,
  selectedId,
  onMarkerClick,
  className = "h-[520px]"
}: {
  markers: MapMarker[];
  selectedId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !mapboxToken) return;
    let cancelled = false;

    void import("mapbox-gl").then((module) => {
      if (!containerRef.current || cancelled) return;
      const mapboxgl = module.default;
      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [106.7, 16.1],
        zoom: 5,
        maxBounds: vietnamBounds
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapboxRef.current = mapboxgl;
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl || !mapReady) return;
    const markerInstances: MarkerInstance[] = markers.map((marker) => {
      const el = document.createElement("button");
      el.type = "button";
      el.ariaLabel = marker.title;
      el.className = `h-4 w-4 rounded-full border-2 border-white shadow-md transition ${selectedId === marker.id ? "scale-125 bg-accent" : marker.type === "restaurant" ? "bg-primary" : "bg-[hsl(var(--warning))]"}`;
      el.onclick = () => onMarkerClick?.(marker);
      const instance = new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(popupHtml(marker)))
        .addTo(map);
      return instance;
    });
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((m) => bounds.extend([m.longitude, m.latitude]));
      map.fitBounds(bounds, { padding: 70, maxZoom: 12 });
    }
    return () => markerInstances.forEach((instance) => instance.remove());
  }, [markers, onMarkerClick, selectedId, mapReady]);

  if (!mapboxToken) {
    return <MapFallback markers={markers} selectedId={selectedId} onMarkerClick={onMarkerClick} className={className} />;
  }

  return <div ref={containerRef} className={`${className} overflow-hidden rounded-lg border`} />;
}

function MapFallback({
  markers,
  selectedId,
  onMarkerClick,
  className
}: {
  markers: MapMarker[];
  selectedId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  className: string;
}) {
  const locale = useCurrentLocale();
  const text = fallbackLabels[locale];
  const positions = useMemo(() => {
    const lats = markers.map((marker) => marker.latitude);
    const lngs = markers.map((marker) => marker.longitude);
    const minLat = Math.min(...lats, 8);
    const maxLat = Math.max(...lats, 22);
    const minLng = Math.min(...lngs, 102);
    const maxLng = Math.max(...lngs, 110);
    const latSpan = Math.max(maxLat - minLat, 0.01);
    const lngSpan = Math.max(maxLng - minLng, 0.01);

    return markers.map((marker) => ({
      marker,
      left: markers.length === 1 ? 50 : 12 + ((marker.longitude - minLng) / lngSpan) * 76,
      top: markers.length === 1 ? 50 : 12 + ((maxLat - marker.latitude) / latSpan) * 76
    }));
  }, [markers]);

  return (
    <div className={`${className} relative overflow-hidden rounded-lg border bg-background food-map-grid`}>
      <div className="absolute inset-0 food-map-sheen" />
      <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-2 text-xs shadow-sm">
        {text.demo}
        <div className="mt-0.5 text-muted-foreground">{text.token}</div>
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-xs shadow-sm">
        <Navigation className="h-3.5 w-3.5 text-primary" />
        {text.directions}
      </div>
      {positions.map(({ marker, left, top }, index) => (
        <button
          key={marker.id}
          type="button"
          onClick={() => onMarkerClick?.(marker)}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
          style={{ left: `${left}%`, top: `${top}%` }}
          aria-label={marker.title}
        >
          <span className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white shadow-lg ${selectedId === marker.id ? "bg-accent text-accent-foreground" : marker.type === "restaurant" ? "bg-primary text-primary-foreground" : "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]"}`}>
            {marker.type === "restaurant" ? index + 1 : <Sparkles className="h-4 w-4" />}
          </span>
          <span className="mt-1 block max-w-36 rounded-md bg-card/95 px-2 py-1 text-xs font-medium shadow-sm">{marker.title}</span>
        </button>
      ))}
    </div>
  );
}
