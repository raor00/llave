"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight Gaussian Splat viewer based on the `gsplat` library.
// Loads .splat or .ply Gaussian Splatting scenes and renders them with
// orbit controls — same family of tech that powers PlayCanvas SuperSplat
// and Luma AI viewers.

export function SplatViewer({ url, title }: { url: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let renderer: { dispose?: () => void } | null = null;

    async function boot() {
      try {
        const SPLAT = await import("gsplat");
        if (cancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;

        const scene = new SPLAT.Scene();
        const camera = new SPLAT.Camera();
        const r = new SPLAT.WebGLRenderer(canvas);
        renderer = r as unknown as { dispose?: () => void };
        const controls = new SPLAT.OrbitControls(camera, canvas);

        await SPLAT.Loader.LoadAsync(
          url,
          scene,
          (p: number) => {
            if (!cancelled) setProgress(Math.round(p * 100));
          },
          /* useCache */ false
        );

        if (cancelled) return;
        setReady(true);

        const frame = () => {
          controls.update();
          r.render(scene, camera);
          raf = requestAnimationFrame(frame);
        };
        frame();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo cargar el splat");
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      renderer?.dispose?.();
    };
  }, [url]);

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] bg-[color:var(--color-fg)]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full"
          aria-label={`Tour Gaussian Splat de ${title}`}
        />
        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-3">
            <div className="text-sm font-medium">Cargando tour 3D · {progress}%</div>
            <div className="w-48 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-[color:var(--color-brand-500)] transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-[color:var(--color-danger)] bg-[color:var(--color-bg-elev)] p-6 text-center text-sm">
            No se pudo cargar el modelo. {error}
          </div>
        )}
      </div>
      <div className="p-4 text-xs text-[color:var(--color-fg-soft)] flex items-center justify-between">
        <span>Gaussian Splat · arrastra para girar, scroll para zoom</span>
        <a href={url} download className="text-[color:var(--color-brand-700)] hover:underline">
          Descargar .splat
        </a>
      </div>
    </div>
  );
}
