"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Center, Bounds } from "@react-three/drei";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

/**
 * MeshViewer — renders triangle-mesh .ply files (typical Polycam photogrammetry
 * export) using three.js PLYLoader. For Gaussian Splat .ply / .splat use
 * SplatViewer instead; for .usdz / .glb / .gltf use Tour3D (<model-viewer>).
 */

function PlyMesh({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const geometry = useLoader(PLYLoader, url) as THREE.BufferGeometry;
  const { camera } = useThree();

  useEffect(() => {
    if (!geometry.attributes.color) {
      geometry.computeVertexNormals();
    } else {
      geometry.computeVertexNormals();
    }
    geometry.center();
    geometry.computeBoundingSphere();
    if (geometry.boundingSphere) {
      const r = geometry.boundingSphere.radius;
      camera.position.set(r * 1.4, r * 0.8, r * 1.4);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
    onLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  const hasColors = !!geometry.attributes.color;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors={hasColors}
        color={hasColors ? undefined : "#c4513a"}
        roughness={0.85}
        metalness={0}
        flatShading
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function MeshViewer({ url, title }: { url: string; title: string }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProgress(0);
    setReady(false);
    setError(null);
    let cancelled = false;
    // pre-fetch to surface progress; useLoader will hit the same URL after.
    fetch(url)
      .then(async (res) => {
        const total = Number(res.headers.get("content-length") || 0);
        if (!res.body || !total) {
          if (!cancelled) setProgress(100);
          return;
        }
        const reader = res.body.getReader();
        let received = 0;
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            received += value.byteLength;
            const pct = Math.round((received / total) * 100);
            if (!cancelled) setProgress(pct);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError("Falla de red al descargar el modelo.");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[color:var(--color-bg)] to-[color:var(--color-brand-50)]">
        <Canvas
          camera={{ position: [3, 2, 3], fov: 45 }}
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true, preserveDrawingBuffer: false }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-3, 4, -2]} intensity={0.45} color="#f4d5c4" />
          <Suspense fallback={null}>
            <Bounds fit clip margin={1.2}>
              <Center>
                <PlyMesh url={url} onLoaded={() => setReady(true)} />
              </Center>
            </Bounds>
          </Suspense>
          <OrbitControls enableDamping makeDefault />
        </Canvas>

        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[color:var(--color-fg-muted)] gap-3 pointer-events-none">
            <div className="text-sm font-medium">Cargando tour 3D · {progress}%</div>
            <div className="w-48 h-1.5 rounded-full bg-[color:var(--color-border)] overflow-hidden">
              <div
                className="h-full bg-[color:var(--color-brand-500)] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-[color:var(--color-danger)] bg-[color:var(--color-bg-elev)] p-6 text-center text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="p-4 text-xs text-[color:var(--color-fg-soft)] flex items-center justify-between">
        <span aria-label={title}>Tour 3D · arrastra para girar, scroll para zoom</span>
        <a href={url} download className="text-[color:var(--color-brand-700)] hover:underline">
          Descargar modelo
        </a>
      </div>
    </div>
  );
}
