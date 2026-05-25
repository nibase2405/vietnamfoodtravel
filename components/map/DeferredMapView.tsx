"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import type { MapMarker } from "@/types";

const DynamicMapView = dynamic(() => import("@/components/map/MapView").then((module) => module.MapView), {
  ssr: false
});

export function DeferredMapView({
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "360px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  if (shouldLoad) {
    return (
      <div className={className}>
        <DynamicMapView markers={markers} selectedId={selectedId} onMarkerClick={onMarkerClick} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      <MapPlaceholder className={className} onLoad={() => setShouldLoad(true)} />
    </div>
  );
}

function MapPlaceholder({ className, onLoad }: { className: string; onLoad?: () => void }) {
  return (
    <button
      type="button"
      onClick={onLoad}
      className={`${className} relative grid w-full place-items-center overflow-hidden rounded-lg border bg-background food-map-grid text-left`}
    >
      <span className="absolute inset-0 food-map-sheen" />
      <span className="relative grid gap-2 rounded-md bg-white px-4 py-3 text-sm shadow-sm">
        <span className="flex items-center gap-2 font-semibold">
          <Navigation className="h-4 w-4 text-primary" />
          載入互動地圖
        </span>
        <span className="text-xs text-muted-foreground">地圖會在接近畫面時載入，提升頁面速度。</span>
      </span>
    </button>
  );
}
