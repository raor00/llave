// Auto-looping product sizzle reel for Llave — 6 stylized scenes, ~24s, loops forever.
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LlaveLogo } from "@/components/llave-logo";

type SceneTone = "dark" | "cream";

type Scene = {
  id: string;
  durationMs: number;
  tone: SceneTone;
  caption: string;
  render: (reduced: boolean) => React.ReactNode;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

// prefers-reduced-motion subscription — SSR-safe via useSyncExternalStore.
function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
}

// Shared scene-element animation — collapses to a plain fade when reduced.
function rise(reduced: boolean, delay = 0) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.4, delay: delay * 0.5 },
    } as const;
  }
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  } as const;
}

function slideX(reduced: boolean, from: number, delay = 0) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.4, delay: delay * 0.5 },
    } as const;
  }
  return {
    initial: { opacity: 0, x: from },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  } as const;
}

// --- Scene mock primitives ---------------------------------------------------

function MockPropertyCard({
  city,
  price,
  rooms,
  delay,
  reduced,
}: {
  city: string;
  price: string;
  rooms: string;
  delay: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      {...slideX(reduced, 60, delay)}
      className="w-full overflow-hidden rounded-2xl border border-[color:var(--color-brand-100)] bg-white shadow-[var(--shadow-card)]"
    >
      <div className="relative h-24 bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-brand-700)] sm:h-28">
        <span className="chip absolute left-2 top-2 bg-white/95 text-xs font-semibold text-[color:var(--color-brand-700)]">
          {price}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-sm font-semibold text-[color:var(--color-fg)]">
          {city}
        </span>
        <span className="chip chip-muted text-xs">{rooms}</span>
      </div>
    </motion.div>
  );
}

function ChatBubble({
  who,
  delay,
  reduced,
  children,
}: {
  who: "user" | "ai";
  delay: number;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const isAi = who === "ai";
  return (
    <motion.div
      {...slideX(reduced, isAi ? -50 : 50, delay)}
      className={`flex items-end gap-2 ${isAi ? "" : "flex-row-reverse"}`}
    >
      {isAi && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]">
          <LlaveLogo className="size-5" />
        </span>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm sm:text-base ${
          isAi
            ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-fg)]"
            : "bg-[color:var(--color-fg)] text-white"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TrustGauge({ reduced }: { reduced: boolean }) {
  // Animated arc filling to ~720/1000 (~72% of a 270deg sweep).
  const target = 0.72;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75; // 270deg visible arc
  const fullArc = circumference * arcFraction;
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 180 180" className="size-44 sm:size-52 -rotate-[135deg]">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--color-brand-100)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${fullArc} ${circumference}`}
        />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${fullArc} ${circumference}`}
          initial={{ strokeDashoffset: fullArc }}
          animate={{ strokeDashoffset: fullArc * (1 - target) }}
          transition={{
            duration: reduced ? 0.4 : 1.4,
            delay: reduced ? 0 : 0.3,
            ease: EASE,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-bold text-[color:var(--color-brand-700)] sm:text-5xl">
          720
        </span>
        <span className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
          Trust Score
        </span>
      </div>
    </div>
  );
}

function Room3D({ reduced }: { reduced: boolean }) {
  // Pure-CSS isometric room: stacked rotating planes + a play triangle.
  return (
    <div className="relative grid h-56 place-items-center sm:h-64">
      <motion.div
        className="relative size-40 sm:size-48"
        style={{ transformStyle: "preserve-3d", perspective: 600 }}
        animate={reduced ? {} : { rotateY: [0, 360] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute inset-0 rounded-lg border-2 border-[color:var(--color-accent)]/60 bg-[color:var(--color-accent)]/5"
            style={{ transform: `rotateY(${deg}deg) translateZ(80px)` }}
          />
        ))}
        <div
          className="absolute inset-0 rounded-lg border-2 border-[color:var(--color-accent)]/40"
          style={{ transform: "rotateX(90deg) translateZ(80px)" }}
        />
        <div
          className="absolute inset-0 rounded-lg border-2 border-[color:var(--color-accent)]/40"
          style={{ transform: "rotateX(-90deg) translateZ(80px)" }}
        />
      </motion.div>
      <motion.div
        className="absolute grid size-16 place-items-center rounded-full bg-white/95 shadow-[var(--shadow-pop)]"
        animate={reduced ? {} : { scale: [1, 1.12, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="ml-1 size-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-[color:var(--color-brand-700)]" />
      </motion.div>
    </div>
  );
}

// --- Scenes ------------------------------------------------------------------

const SCENES: Scene[] = [
  // 1 — Hook
  {
    id: "hook",
    durationMs: 4200,
    tone: "dark",
    caption: "Venezuela · 2026",
    render: (reduced) => (
      <div className="flex flex-col items-center text-center">
        <motion.div
          {...rise(reduced, 0)}
          className="text-[color:var(--color-accent)]"
        >
          <LlaveLogo className="size-24 sm:size-32" />
        </motion.div>
        <motion.h2
          {...rise(reduced, 0.45)}
          className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl"
        >
          Alquilar no debería ser un muro.
        </motion.h2>
        <motion.p
          {...rise(reduced, 0.95)}
          className="mt-3 font-display text-2xl font-bold text-[color:var(--color-accent)] sm:text-4xl"
        >
          Llave lo derriba.
        </motion.p>
      </div>
    ),
  },
  // 2 — Buscar
  {
    id: "buscar",
    durationMs: 4000,
    tone: "cream",
    caption: "Encuentra tu inmueble. Solo cédula.",
    render: (reduced) => (
      <div className="flex flex-col items-center">
        <motion.span
          {...rise(reduced, 0)}
          className="chip mb-6 bg-white text-[color:var(--color-brand-700)]"
        >
          Marketplace Llave
        </motion.span>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <MockPropertyCard
            city="Caracas"
            price="$280/mes"
            rooms="2 hab"
            delay={0.15}
            reduced={reduced}
          />
          <MockPropertyCard
            city="Valencia"
            price="$210/mes"
            rooms="1 hab"
            delay={0.3}
            reduced={reduced}
          />
          <MockPropertyCard
            city="Maracaibo"
            price="$340/mes"
            rooms="3 hab"
            delay={0.45}
            reduced={reduced}
          />
        </div>
      </div>
    ),
  },
  // 3 — Llavero IA
  {
    id: "llavero",
    durationMs: 4400,
    tone: "cream",
    caption: "Llavero responde con datos reales.",
    render: (reduced) => (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
        <motion.span
          {...rise(reduced, 0)}
          className="chip mb-2 self-center bg-white text-[color:var(--color-brand-700)]"
        >
          Llavero IA
        </motion.span>
        <ChatBubble who="user" delay={0.2} reduced={reduced}>
          Busco apto en Caracas, $300
        </ChatBubble>
        <ChatBubble who="ai" delay={0.7} reduced={reduced}>
          Tengo 3 opciones para ti
        </ChatBubble>
        <motion.div
          {...rise(reduced, 1.15)}
          className="ml-10 w-[78%] max-w-[280px] overflow-hidden rounded-2xl border border-[color:var(--color-brand-100)] bg-white shadow-[var(--shadow-card)]"
        >
          <div className="relative h-20 bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-brand-700)]">
            <span className="chip absolute left-2 top-2 bg-white/95 text-xs font-semibold text-[color:var(--color-brand-700)]">
              $290/mes
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold">Chacao, Caracas</span>
            <span className="chip chip-muted text-xs">2 hab</span>
          </div>
        </motion.div>
      </div>
    ),
  },
  // 4 — Tour 3D
  {
    id: "tour",
    durationMs: 4000,
    tone: "dark",
    caption: "Recorre el inmueble antes de viajar.",
    render: (reduced) => (
      <div className="flex flex-col items-center">
        <motion.span
          {...rise(reduced, 0)}
          className="chip mb-4 border-white/25 bg-white/10 text-[color:var(--color-accent)]"
        >
          Tour 3D
        </motion.span>
        <motion.div {...rise(reduced, 0.15)} className="w-full max-w-md">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <Room3D reduced={reduced} />
          </div>
        </motion.div>
      </div>
    ),
  },
  // 5 — Garantía + Trust Score
  {
    id: "garantia",
    durationMs: 4200,
    tone: "cream",
    caption: "Cero depósito. Llave responde. Tu reputación vale.",
    render: (reduced) => (
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-14">
        <motion.div
          {...rise(reduced, 0.1)}
          className="flex flex-col items-center"
        >
          <div className="flex items-end gap-1">
            <span className="font-display text-7xl font-bold text-[color:var(--color-brand-700)] sm:text-8xl">
              0
            </span>
            <span className="mb-3 font-display text-3xl font-bold text-[color:var(--color-fg-soft)] line-through sm:text-4xl">
              $
            </span>
          </div>
          <span className="mt-1 text-sm font-semibold uppercase tracking-wider text-[color:var(--color-fg-soft)]">
            Cero depósito
          </span>
        </motion.div>
        <motion.div {...rise(reduced, 0.3)}>
          <TrustGauge reduced={reduced} />
        </motion.div>
      </div>
    ),
  },
  // 6 — Cierre
  {
    id: "cierre",
    durationMs: 4000,
    tone: "dark",
    caption: "Alquila en 24 horas.",
    render: (reduced) => (
      <div className="flex flex-col items-center text-center">
        <motion.div
          {...rise(reduced, 0)}
          className="text-[color:var(--color-accent)]"
          animate={
            reduced
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: [1, 1.06, 1] }
          }
          transition={
            reduced
              ? { duration: 0.4 }
              : { scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
          }
        >
          <LlaveLogo className="size-20 sm:size-28" />
        </motion.div>
        <motion.h2
          {...rise(reduced, 0.4)}
          className="mt-5 font-display text-6xl font-bold text-white sm:text-8xl"
        >
          Llave
        </motion.h2>
        <motion.p
          {...rise(reduced, 0.8)}
          className="mt-2 font-display text-2xl font-bold text-[color:var(--color-accent)] sm:text-3xl"
        >
          Alquila en 24 horas.
        </motion.p>
        <motion.span
          {...rise(reduced, 1.2)}
          className="mt-5 text-sm font-semibold tracking-wide text-white/60"
        >
          llave-ruby.vercel.app
        </motion.span>
      </div>
    ),
  },
];

const TOTAL_MS = SCENES.reduce((acc, s) => acc + s.durationMs, 0);

export function ShowcaseReel() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  const scene = SCENES[index];
  const dark = scene.tone === "dark";

  const exit = useCallback(() => router.push("/"), [router]);

  // Autoplay timer — per-scene duration, loops back to scene 0 forever.
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const step = (now: number) => {
      const delta = now - start;
      setElapsed(delta);
      if (delta >= scene.durationMs) {
        setElapsed(0);
        setIndex((prev) => (prev + 1) % SCENES.length);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, scene.durationMs, index]);

  // Keyboard: Escape exits, Space toggles play.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exit();
      } else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit]);

  const loopProgress = useMemo(() => {
    const before = SCENES.slice(0, index).reduce((a, s) => a + s.durationMs, 0);
    return Math.min(1, (before + elapsed) / TOTAL_MS);
  }, [index, elapsed]);

  return (
    <div
      className={`fixed inset-0 z-[110] flex flex-col overflow-hidden transition-colors duration-500 ${
        dark
          ? "bg-[color:var(--color-brand-900)] text-white"
          : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]"
      }`}
    >
      {/* Loop progress bar */}
      <div className="absolute inset-x-0 top-0 z-30 h-1 bg-current/10">
        <motion.div
          className="h-full bg-[color:var(--color-brand-500)]"
          animate={{ width: `${loopProgress * 100}%` }}
          transition={{ ease: "linear", duration: 0.2 }}
        />
      </div>

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full border border-current/25 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-current/10"
          aria-label={playing ? "Pausar" : "Reproducir"}
        >
          {playing ? "Pausar" : "Reproducir"}
        </button>
        <button
          type="button"
          onClick={exit}
          className="rounded-full border border-current/25 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-current/10"
          aria-label="Salir"
        >
          Salir
        </button>
      </div>

      {/* Scene stage */}
      <div className="container-x flex flex-1 items-center justify-center py-20">
        <div className="mx-auto w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, x: reduced ? 0 : 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : -32 }}
              transition={{ duration: reduced ? 0.3 : 0.4, ease: EASE }}
            >
              {scene.render(reduced)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Caption */}
      <div className="relative z-30 px-6 pb-10 text-center sm:pb-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={scene.id}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`mx-auto max-w-2xl font-display text-xl font-semibold leading-snug sm:text-3xl ${
              dark ? "text-white" : "text-[color:var(--color-fg)]"
            }`}
          >
            {scene.caption}
          </motion.p>
        </AnimatePresence>
        <div className="mt-4 flex items-center justify-center gap-2">
          {SCENES.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-[color:var(--color-brand-500)]"
                  : "w-1.5 bg-current/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
