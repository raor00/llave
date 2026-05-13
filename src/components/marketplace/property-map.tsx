"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MLMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Property, PropertySummary } from "@/lib/types";
import { formatUSD } from "@/lib/format";

const TILES = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function PropertyMap({
  properties,
  height = 480,
}: {
  properties: Array<Property | PropertySummary>;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: TILES,
      center: [-66.9036, 10.4806],
      zoom: 5.4,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let added = 0;
    for (const p of properties) {
      if (typeof (p as Property).lat !== "number" || typeof (p as Property).lng !== "number") continue;
      const lat = (p as Property).lat!;
      const lng = (p as Property).lng!;
      const el = document.createElement("div");
      el.className =
        "rounded-full bg-[#128c5d] text-white font-semibold text-xs px-2.5 py-1 shadow-md border-2 border-white cursor-pointer hover:scale-110 transition";
      el.textContent = formatUSD(p.price_usd);

      const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
        `<a href="/inmueble/${p.id}" style="text-decoration:none;color:inherit;">
           <div style="width:200px">
             ${p.cover_url ? `<img src="${p.cover_url}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ""}
             <div style="font-weight:600;font-size:13px;line-height:1.3;color:#0b1f1c">
               ${p.title.replace(/^Llave:\s*/, "")}
             </div>
             <div style="font-size:12px;color:#4a5b58;margin-top:2px">${p.city} · ${p.rooms} hab · ${p.bathrooms} baños</div>
             <div style="font-weight:700;font-size:14px;margin-top:4px;color:#0e6f4a">${formatUSD(p.price_usd)}/mes</div>
           </div>
         </a>`
      );

      const m = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
      markersRef.current.push(m);
      bounds.extend([lng, lat]);
      added++;
    }

    if (added > 0) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 600 });
    }
  }, [properties]);

  return (
    <div
      className="card overflow-hidden relative"
      style={{ height }}
    >
      <div ref={ref} className="absolute inset-0" />
    </div>
  );
}
