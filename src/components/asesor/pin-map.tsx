"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MLMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const TILES = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/**
 * Single-marker map used by the asesor publishing wizard. The marker is
 * draggable so the asesor can correct the location if the EXIF reading or
 * the browser geolocation is off. Calling code receives the new coords via
 * `onChange`.
 */
export function PinMap({
  lat,
  lng,
  onChange,
  height = 240,
}: {
  lat: number;
  lng: number;
  onChange?: (coords: { lat: number; lng: number }) => void;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: TILES,
      center: [lng, lat],
      zoom: 14,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const el = document.createElement("div");
    el.style.width = "26px";
    el.style.height = "26px";
    el.style.borderRadius = "50%";
    el.style.background = "var(--color-brand-500)";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 4px 10px rgba(0,0,0,.3)";

    const marker = new maplibregl.Marker({ element: el, draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    marker.on("dragend", () => {
      const ll = marker.getLngLat();
      onChangeRef.current?.({ lat: ll.lat, lng: ll.lng });
    });
    markerRef.current = marker;

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChangeRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External lat/lng changes (e.g. browser geolocation completes after mount)
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat([lng, lat]);
    map.flyTo({ center: [lng, lat], zoom: 14, duration: 600 });
  }, [lat, lng]);

  return (
    <div
      ref={ref}
      className="w-full rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-border)]"
      style={{ height }}
    />
  );
}
