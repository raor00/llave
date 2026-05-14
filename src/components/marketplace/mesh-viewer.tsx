"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Center,
  Bounds,
  PointerLockControls,
  KeyboardControls,
  useKeyboardControls,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

/**
 * MeshViewer — renderiza .ply (mesh fotogramétrico Polycam) en dos modos:
 *   - Dollhouse: OrbitControls (vista exterior, recorrer girando)
 *   - Walkthrough: PointerLockControls + WASD (vista en primera persona,
 *     similar a Matterport). Click sobre el canvas → pointer lock; ESC sale.
 *
 * El walkthrough requiere mesh con piso/paredes/techo cerrados. Cuando el
 * scan tiene huecos (típico de fotogrametría rápida) algunas áreas se ven
 * negras: la solución es escanear con cobertura completa (modo Room en
 * Polycam, o futuras integraciones con Apple RoomPlan).
 */

type MeshViewerMode = "dollhouse" | "walkthrough";

const KEYS = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "up", keys: ["Space"] },
  { name: "down", keys: ["ShiftLeft", "ShiftRight"] },
];

function PlyMesh({
  url,
  mode,
  onLoaded,
}: {
  url: string;
  mode: MeshViewerMode;
  onLoaded: (info: { radius: number; centerY: number }) => void;
}) {
  const geometry = useLoader(PLYLoader, url) as THREE.BufferGeometry;
  const { camera } = useThree();

  useEffect(() => {
    geometry.computeVertexNormals();
    geometry.center();
    geometry.computeBoundingSphere();
    const radius = geometry.boundingSphere?.radius ?? 5;
    const bbox = geometry.boundingBox ?? new THREE.Box3().setFromBufferAttribute(geometry.attributes.position as THREE.BufferAttribute);
    geometry.computeBoundingBox();
    const centerY = bbox.min.y + (bbox.max.y - bbox.min.y) * 0.4;

    if (mode === "walkthrough") {
      // Cámara dentro del mesh, altura ojo humano relativa a la altura del
      // bounding box, mirando hacia adelante.
      camera.position.set(0, centerY, 0);
      camera.lookAt(radius, centerY, 0);
    } else {
      camera.position.set(radius * 1.2, radius * 0.7, radius * 1.2);
      camera.lookAt(0, 0, 0);
    }
    camera.near = 0.05;
    camera.far = radius * 60;
    camera.updateProjectionMatrix();
    onLoaded({ radius, centerY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, mode]);

  const hasColors = !!geometry.attributes.color;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors={hasColors}
        color={hasColors ? undefined : "#c4513a"}
        roughness={0.85}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Hook de movimiento WASD para modo walkthrough. Mantiene la cámara a la
 * misma altura (no flota / no se hunde) salvo que el usuario use Space/Shift.
 * `getDirection` ignora la componente Y para que avanzar mirando al piso no
 * te hunda en el mesh.
 */
function WalkthroughPlayer({ speed = 0.06 }: { speed?: number }) {
  const [, get] = useKeyboardControls();
  const direction = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const { forward, backward, left, right: r, up, down } = get();
    if (!forward && !backward && !left && !r && !up && !down) return;

    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    right.crossVectors(direction, camera.up).normalize();

    const v = speed * 60 * delta;
    if (forward) camera.position.addScaledVector(direction, v);
    if (backward) camera.position.addScaledVector(direction, -v);
    if (left) camera.position.addScaledVector(right, -v);
    if (r) camera.position.addScaledVector(right, v);
    if (up) camera.position.y += v;
    if (down) camera.position.y -= v;
  });

  return null;
}

export function MeshViewer({ url, title }: { url: string; title: string }) {
  const [mode, setMode] = useState<MeshViewerMode>("dollhouse");
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const plcRef = useRef<React.ComponentRef<typeof PointerLockControls> | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    setProgress(0);
    setReady(false);
    setError(null);
    let cancelled = false;
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

  function enterWalkthrough() {
    setMode("walkthrough");
    // pequeño delay para que PointerLockControls se monte antes de pedir lock
    setTimeout(() => plcRef.current?.lock(), 60);
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[color:var(--color-bg)] to-[color:var(--color-brand-50)] sm:aspect-[16/9]">
        <KeyboardControls map={KEYS}>
          <Canvas
            camera={{ position: [3, 2, 3], fov: 60 }}
            dpr={[1, 2]}
            shadows
            gl={{ antialias: true, preserveDrawingBuffer: false }}
          >
            <ambientLight intensity={0.55} />
            <hemisphereLight args={["#fff7ee", "#3a2a22", 0.55]} />
            <directionalLight
              position={[6, 9, 5]}
              intensity={1.0}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight position={[-4, 4, -3]} intensity={0.4} color="#f4d5c4" />
            <Suspense fallback={null}>
              {mode === "dollhouse" ? (
                <Bounds fit clip margin={1.15}>
                  <Center>
                    <PlyMesh url={url} mode={mode} onLoaded={() => setReady(true)} />
                  </Center>
                </Bounds>
              ) : (
                <>
                  <Center>
                    <PlyMesh url={url} mode={mode} onLoaded={() => setReady(true)} />
                  </Center>
                  <WalkthroughPlayer />
                </>
              )}
              <Environment preset="apartment" />
            </Suspense>

            {mode === "dollhouse" ? (
              <OrbitControls
                enableDamping
                makeDefault
                minDistance={0.5}
                maxDistance={50}
                dampingFactor={0.08}
              />
            ) : (
              <PointerLockControls
                ref={plcRef}
                onLock={() => setLocked(true)}
                onUnlock={() => setLocked(false)}
              />
            )}
          </Canvas>
        </KeyboardControls>

        {/* Mode switch */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/85 backdrop-blur px-1 py-1 border border-[color:var(--color-border)] shadow-[var(--shadow-soft)] z-10">
          <ModeBtn active={mode === "dollhouse"} onClick={() => setMode("dollhouse")}>
            Casa de muñecas
          </ModeBtn>
          <ModeBtn active={mode === "walkthrough"} onClick={enterWalkthrough} disabled={isMobile}>
            Walkthrough
          </ModeBtn>
        </div>

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

        {mode === "walkthrough" && ready && !locked && (
          <button
            type="button"
            onClick={() => plcRef.current?.lock()}
            className="absolute inset-0 grid place-items-center bg-black/35 text-white text-center px-4"
          >
            <div className="rounded-[var(--radius-lg)] bg-white/95 text-[color:var(--color-fg)] p-5 max-w-sm">
              <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-1">
                Modo walkthrough
              </div>
              <div className="font-display text-base font-semibold leading-tight">
                Haz clic para entrar al inmueble
              </div>
              <ul className="text-xs text-[color:var(--color-fg-muted)] mt-3 space-y-1 text-left">
                <li><strong>WASD</strong> o <strong>flechas</strong> para moverte</li>
                <li><strong>Mouse</strong> para mirar alrededor</li>
                <li><strong>Espacio</strong> sube · <strong>Shift</strong> baja</li>
                <li><strong>Esc</strong> para salir</li>
              </ul>
            </div>
          </button>
        )}

        {mode === "walkthrough" && locked && (
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-black/60 text-white text-[11px] px-3 py-1.5 font-semibold z-10">
            <span className="size-1.5 rounded-full bg-[color:var(--color-accent)] animate-pulse" />
            Walkthrough activo · Esc para salir
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-[color:var(--color-danger)] bg-[color:var(--color-bg-elev)] p-6 text-center text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-[color:var(--color-fg-soft)] leading-snug" aria-label={title}>
          {mode === "dollhouse"
            ? "Arrastra para girar · scroll/pellizco para zoom · 2 dedos para pan"
            : isMobile
              ? "Walkthrough requiere mouse + teclado (no soportado en táctil)"
              : "WASD para moverte · mouse para mirar · Esc para salir"}
        </div>
        <a
          href={url}
          download
          className="text-xs text-[color:var(--color-brand-700)] hover:underline font-semibold"
        >
          Descargar modelo .ply
        </a>
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  disabled,
  children,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
        active
          ? "bg-[color:var(--color-brand-500)] text-white"
          : "text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg)] disabled:opacity-40 disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}
