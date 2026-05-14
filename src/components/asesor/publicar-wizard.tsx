"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { extractGpsFromImage, reverseGeocode } from "@/lib/exif";

const PinMap = dynamic(() => import("./pin-map").then((m) => m.PinMap), { ssr: false });

type LocationSource = "exif" | "browser" | "manual" | null;

type Resolved = {
  lat: number;
  lng: number;
  source: LocationSource;
  label?: string;
  neighbourhood?: string;
  city?: string;
  state?: string;
};

const CARACAS_FALLBACK = { lat: 10.4806, lng: -66.9036 };

/**
 * Publishing wizard for the asesor. Three jobs:
 * 1) Read EXIF GPS from uploaded photos and confirm the zone.
 * 2) If no GPS in photos, request browser geolocation (asesor in situ).
 * 3) Send everything resolved (coords, neighbourhood, city, photos count,
 *    taken-at time) to Llavero as the first chat message so the agent
 *    has full context before suggesting title, description and price.
 */
export function PublicarWizard() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [reading, setReading] = useState(false);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "asking" | "denied" | "ok" | "error">("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setPhotos(arr);
    setReading(true);
    setConfirmed(false);
    setResolved(null);

    // Walk photos in order, first one with GPS wins.
    let coords: { lat: number; lng: number; takenAt?: string } | null = null;
    for (const f of arr) {
      const gps = await extractGpsFromImage(f);
      if (gps) {
        coords = gps;
        break;
      }
    }

    if (coords) {
      // Reverse geocode in background; don't block the UI on it.
      setResolved({
        lat: coords.lat,
        lng: coords.lng,
        source: "exif",
      });
      const place = await reverseGeocode(coords.lat, coords.lng);
      setResolved({
        lat: coords.lat,
        lng: coords.lng,
        source: "exif",
        label: place?.label,
        neighbourhood: place?.neighbourhood,
        city: place?.city,
        state: place?.state,
      });
    }
    setReading(false);
  }, []);

  const askBrowserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("asking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setResolved({ lat: latitude, lng: longitude, source: "browser" });
        const place = await reverseGeocode(latitude, longitude);
        setResolved({
          lat: latitude,
          lng: longitude,
          source: "browser",
          label: place?.label,
          neighbourhood: place?.neighbourhood,
          city: place?.city,
          state: place?.state,
        });
        setGeoStatus("ok");
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 }
    );
  }, []);

  // Auto-request browser location when there's no EXIF GPS on the first photo
  useEffect(() => {
    if (reading) return;
    if (resolved) return;
    if (photos.length === 0) return;
    askBrowserLocation();
  }, [reading, resolved, photos.length, askBrowserLocation]);

  const onPinChange = useCallback((coords: { lat: number; lng: number }) => {
    setResolved((prev) => ({
      lat: coords.lat,
      lng: coords.lng,
      source: prev?.source === "exif" ? "manual" : prev?.source === "browser" ? "manual" : "manual",
      label: undefined,
      neighbourhood: undefined,
      city: undefined,
      state: undefined,
    }));
    setConfirmed(false);
    // Re-resolve the label after a manual drag
    reverseGeocode(coords.lat, coords.lng).then((place) => {
      setResolved((prev) =>
        prev
          ? {
              ...prev,
              label: place?.label,
              neighbourhood: place?.neighbourhood,
              city: place?.city,
              state: place?.state,
            }
          : prev
      );
    });
  }, []);

  const llaveroHref = useMemo(() => {
    if (!resolved || !confirmed) return null;
    const lines = [
      `Hola Llavero, estoy publicando un inmueble nuevo desde el wizard del asesor.`,
      `Ubicación confirmada: ${resolved.label ?? `${resolved.lat.toFixed(5)}, ${resolved.lng.toFixed(5)}`}.`,
      resolved.neighbourhood ? `Zona: ${resolved.neighbourhood}.` : null,
      resolved.city ? `Ciudad: ${resolved.city}.` : null,
      resolved.state ? `Estado: ${resolved.state}.` : null,
      `Coordenadas exactas: lat ${resolved.lat.toFixed(6)}, lng ${resolved.lng.toFixed(6)}.`,
      `Fuente: ${resolved.source === "exif" ? "metadata de la foto" : resolved.source === "browser" ? "ubicación del navegador" : "ajustada manualmente"}.`,
      `Tengo ${photos.length} foto${photos.length === 1 ? "" : "s"} cargada${photos.length === 1 ? "" : "s"}.`,
      `Por favor sugiéreme título, descripción, precio competitivo según comparables y publica el borrador con createPropertyDraft.`,
    ].filter(Boolean) as string[];
    return `/chat?context=${encodeURIComponent(lines.join(" "))}`;
  }, [resolved, confirmed, photos.length]);

  const fallback = resolved ?? { ...CARACAS_FALLBACK, source: null as LocationSource };

  return (
    <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
      <div className="card p-5 sm:p-6 space-y-5">
        {/* Step 1 — fotos */}
        <div>
          <StepBadge n={1} title="Sube fotos del inmueble" />
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
            Si las fotos tienen GPS (la cámara del iPhone lo trae por defecto), Llave detecta la zona automáticamente.
            Si no, te pedimos permiso de ubicación al estar in situ.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="btn btn-primary text-sm"
            >
              {photos.length > 0 ? "Cambiar fotos" : "Subir fotos"}
            </button>
            {photos.length > 0 && (
              <span className="chip">{photos.length} foto{photos.length === 1 ? "" : "s"}</span>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Step 2 — ubicación */}
        <div className="border-t border-[color:var(--color-border)] pt-5">
          <StepBadge n={2} title="Confirma la ubicación" />
          {reading && (
            <div className="mt-3 text-sm text-[color:var(--color-fg-muted)] flex items-center gap-2">
              <span className="size-3 rounded-full bg-[color:var(--color-brand-500)] animate-pulse" />
              Leyendo metadata de las fotos…
            </div>
          )}

          {!reading && resolved && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg bg-[color:var(--color-brand-50)] border border-[color:var(--color-brand-100)] p-3">
                <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">
                  {resolved.source === "exif" && "GPS detectado en la foto"}
                  {resolved.source === "browser" && "Ubicación del navegador"}
                  {resolved.source === "manual" && "Ajustada manualmente"}
                </div>
                <div className="font-semibold text-sm">
                  {resolved.label ?? `${resolved.lat.toFixed(5)}, ${resolved.lng.toFixed(5)}`}
                </div>
                <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-0.5">
                  lat {resolved.lat.toFixed(5)} · lng {resolved.lng.toFixed(5)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  className={`btn ${confirmed ? "btn-primary" : "btn-outline"} text-sm`}
                  disabled={confirmed}
                >
                  {confirmed ? "Ubicación confirmada" : "Sí, esta es la zona"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmed(false);
                    askBrowserLocation();
                  }}
                  className="btn btn-outline text-sm"
                >
                  Usar mi ubicación actual
                </button>
              </div>
              <p className="text-[11px] text-[color:var(--color-fg-soft)]">
                Si la marca no está donde corresponde, arrastra el pin del mapa o haz click en la posición correcta.
              </p>
            </div>
          )}

          {!reading && !resolved && photos.length === 0 && (
            <div className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
              Sube al menos una foto para empezar.
            </div>
          )}

          {!reading && !resolved && photos.length > 0 && geoStatus === "idle" && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-[color:var(--color-fg-muted)]">
                Ninguna foto trae GPS. Compartí la ubicación del navegador para pinchar la zona automáticamente.
              </p>
              <button type="button" onClick={askBrowserLocation} className="btn btn-primary text-sm">
                Compartir mi ubicación
              </button>
            </div>
          )}
          {geoStatus === "denied" && (
            <p className="mt-3 text-xs text-[color:var(--color-danger)]">
              Permiso de ubicación denegado. Arrastra el pin del mapa para fijar la zona manualmente.
            </p>
          )}
          {geoStatus === "error" && (
            <p className="mt-3 text-xs text-[color:var(--color-danger)]">
              No pudimos resolver tu ubicación. Pincha la zona en el mapa.
            </p>
          )}
        </div>

        {/* Step 3 — Llavero */}
        <div className="border-t border-[color:var(--color-border)] pt-5">
          <StepBadge n={3} title="Llavero toma el control" />
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
            Cuando confirmes, Llavero recibe ubicación + ciudad + cantidad de fotos y te propone título, descripción y precio en base a comparables. El borrador queda en tu cartera.
          </p>
          {llaveroHref ? (
            <Link href={llaveroHref} className="btn btn-primary mt-3 text-sm">
              Conversar con Llavero
            </Link>
          ) : (
            <button type="button" disabled className="btn btn-primary mt-3 text-sm opacity-50 cursor-not-allowed">
              Confirma la ubicación primero
            </button>
          )}
        </div>
      </div>

      <div className="card p-3 sm:p-4">
        <div className="flex items-baseline justify-between mb-2 px-1">
          <h3 className="font-display text-sm font-semibold">Mapa de la zona</h3>
          <span className="text-[10px] text-[color:var(--color-fg-soft)]">click o drag para corregir</span>
        </div>
        <PinMap
          lat={fallback.lat}
          lng={fallback.lng}
          onChange={onPinChange}
          height={360}
        />
        <p className="text-[11px] text-[color:var(--color-fg-soft)] mt-2 px-1">
          {resolved
            ? "Llavero usará estas coordenadas + reverse-geocoding para ubicar tu publicación."
            : "Caracas en el centro hasta que detectemos tu ubicación."}
        </p>
      </div>
    </section>
  );
}

function StepBadge({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-6 rounded-full bg-[color:var(--color-brand-500)] text-white text-xs font-bold grid place-items-center">
        {n}
      </span>
      <h2 className="font-display text-base sm:text-lg font-semibold">{title}</h2>
    </div>
  );
}
