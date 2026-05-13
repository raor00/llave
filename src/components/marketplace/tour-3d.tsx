"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

type ModelViewerProps = {
  src?: string;
  "ios-src"?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "shadow-intensity"?: string;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
};

// model-viewer is a Web Component; alias it as a typed React component without
// having to declare a global JSX intrinsic.
const ModelViewerEl = "model-viewer" as unknown as React.FC<ModelViewerProps>;

export function Tour3D({ url, title }: { url: string; title: string }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      loaded.current = true;
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.type = "module";
    s.async = true;
    document.head.appendChild(s);
    loaded.current = true;
  }, []);

  const isUsdz = /\.usdz(\?|$)/i.test(url);

  return (
    <div className="card overflow-hidden">
      <div className="aspect-[16/10] bg-[color:var(--color-bg)]">
        <ModelViewerEl
          src={isUsdz ? undefined : url}
          ios-src={isUsdz ? url : undefined}
          alt={`Tour 3D de ${title}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          loading="lazy"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </div>
      <div className="p-4 text-xs text-[color:var(--color-fg-soft)] flex items-center justify-between">
        <span>Tour 3D · arrastrá para girar, scroll para zoom</span>
        <a href={url} download className="text-[color:var(--color-brand-700)] hover:underline">
          Descargar modelo
        </a>
      </div>
    </div>
  );
}
