"use client";

import { createElement, useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

type ModelViewerElement = HTMLElement & {
  dismissPoster?: () => void;
};

type ModelViewerProps = {
  ref?: React.Ref<ModelViewerElement>;
  src?: string;
  "ios-src"?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "shadow-intensity"?: string;
  exposure?: string;
  loading?: "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  style?: React.CSSProperties;
  className?: string;
};

export function Tour3D({ url, title }: { url: string; title: string }) {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUsdz = /\.usdz(\?|$)/i.test(url);

  useEffect(() => {
    if (isUsdz) return;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      if (customElements.get("model-viewer")) window.setTimeout(() => setScriptReady(true), 0);
      else existing.addEventListener("load", () => setScriptReady(true), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.type = "module";
    s.async = true;
    s.addEventListener("load", () => setScriptReady(true), { once: true });
    s.addEventListener("error", () => setError("No se pudo cargar el visor 3D."), { once: true });
    document.head.appendChild(s);
  }, [isUsdz]);

  useEffect(() => {
    if (!scriptReady || !viewerRef.current) return;
    const el = viewerRef.current;
    const onLoad = () => {
      setReady(true);
      setError(null);
    };
    const onError = () => {
      setError("No se pudo renderizar este modelo. Para iPhone, exportá desde Polycam como GLB/GLTF para verlo inline.");
    };
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
  }, [scriptReady, url]);

  if (isUsdz) {
    return (
      <div className="card overflow-hidden">
        <div className="aspect-[16/10] bg-[color:var(--color-brand-50)] grid place-items-center p-6 text-center">
          <div className="max-w-sm">
            <div className="font-display text-xl font-semibold">Modelo USDZ listo para iPhone</div>
            <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">
              USDZ funciona mejor como AR Quick Look. Para ver el tour dentro de la ficha, exportá también una versión GLB/GLTF desde Polycam.
            </p>
            <a href={url} rel="ar" className="btn btn-primary mt-4 inline-flex">
              Abrir en AR
            </a>
          </div>
        </div>
        <Footer url={url} label="USDZ · AR Quick Look" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] bg-[color:var(--color-bg)]">
        {scriptReady && !error ? (
          // eslint-disable-next-line react-hooks/refs
          createModelViewer({
            ref: viewerRef,
            src: url,
            alt: `Tour 3D de ${title}`,
            ar: true,
            "ar-modes": "webxr scene-viewer quick-look",
            "camera-controls": true,
            "auto-rotate": true,
            "shadow-intensity": "1",
            exposure: "1",
            loading: "eager",
            reveal: "auto",
            className: "absolute inset-0 size-full",
            style: { width: "100%", height: "100%", background: "transparent" },
          })
        ) : null}

        {!ready && !error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6 text-[color:var(--color-fg-muted)]">
            <div className="text-sm font-medium">Cargando tour 3D…</div>
            <div className="w-48 h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
              <div className="h-full w-1/2 animate-pulse bg-[color:var(--color-brand-500)]" />
            </div>
            <a href={url} className="text-xs text-[color:var(--color-brand-700)] underline">
              Si no carga, abrir archivo directamente
            </a>
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-0 grid place-items-center bg-[color:var(--color-bg-elev)] p-6 text-center">
            <div className="max-w-sm">
              <div className="font-semibold text-[color:var(--color-danger)]">Tour no disponible</div>
              <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">{error}</p>
              <a href={url} className="btn btn-outline mt-4 inline-flex">
                Descargar modelo
              </a>
            </div>
          </div>
        ) : null}
      </div>
      <Footer url={url} label="Tour 3D · arrastra para girar, pellizca para zoom" />
    </div>
  );
}

function createModelViewer(props: ModelViewerProps) {
  // Avoid declaring a global JSX intrinsic for the custom element.
  return createElement("model-viewer", props);
}

function Footer({ url, label }: { url: string; label: string }) {
  return (
    <div className="p-4 text-xs text-[color:var(--color-fg-soft)] flex items-center justify-between">
      <span>{label}</span>
      <a href={url} download className="text-[color:var(--color-brand-700)] hover:underline">
        Descargar modelo
      </a>
    </div>
  );
}
