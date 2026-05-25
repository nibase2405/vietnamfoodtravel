"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapboxToken, vietnamBounds } from "@/lib/mapbox/config";

type MapboxModule = typeof import("mapbox-gl")["default"];
type MapInstance = import("mapbox-gl").Map;
type MarkerInstance = import("mapbox-gl").Marker;

export function MapCoordinatePicker({
  defaultLat = 10.7769,
  defaultLng = 106.7009,
  onChange
}: {
  defaultLat?: number;
  defaultLng?: number;
  onChange?: (value: { latitude: number; longitude: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const markerRef = useRef<MarkerInstance | null>(null);
  const [isPending, startTransition] = useTransition();
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);

  function updatePosition(latitude: number, longitude: number, moveMap = true) {
    setLat(latitude);
    setLng(longitude);
    onChange?.({ latitude, longitude });
    markerRef.current?.setLngLat([longitude, latitude]);
    if (moveMap) mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 13 });
  }

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
        center: [defaultLng, defaultLat],
        zoom: 12,
        maxBounds: vietnamBounds
      });
      const marker = new mapboxgl.Marker({ draggable: true }).setLngLat([defaultLng, defaultLat]).addTo(map);
      marker.on("dragend", () => {
        const position = marker.getLngLat();
        updatePosition(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)), false);
      });
      map.on("click", (event) => {
        updatePosition(Number(event.lngLat.lat.toFixed(6)), Number(event.lngLat.lng.toFixed(6)), false);
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapboxRef.current = mapboxgl;
      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapboxRef.current = null;
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [defaultLat, defaultLng]);

  async function geocode() {
    if (!address.trim() || !mapboxToken) return;
    const params = new URLSearchParams({
      access_token: mapboxToken,
      country: "VN",
      limit: "1",
      language: "zh-TW,zh-CN,en,vi"
    });
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?${params.toString()}`);
    if (!response.ok) throw new Error("Geocoding failed");
    const data = await response.json();
    const center = data.features?.[0]?.center;
    if (!center) throw new Error("Address not found");
    updatePosition(Number(center[1].toFixed(6)), Number(center[0].toFixed(6)));
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="搜尋越南地址" />
        <Button
          type="button"
          variant="outline"
          disabled={isPending || !mapboxToken}
          onClick={() => startTransition(() => void geocode().catch((error) => window.alert(error.message)))}
        >
          搜尋
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="latitude" value={lat} onChange={(event) => updatePosition(Number(event.target.value), lng)} />
        <Input name="longitude" value={lng} onChange={(event) => updatePosition(lat, Number(event.target.value))} />
      </div>
      {mapboxToken ? <div ref={containerRef} className="h-80 overflow-hidden rounded-lg border" /> : <div className="grid h-80 place-items-center rounded-lg border bg-muted text-sm text-muted-foreground">設定 NEXT_PUBLIC_MAPBOX_TOKEN 後可使用互動地圖</div>}
    </div>
  );
}
