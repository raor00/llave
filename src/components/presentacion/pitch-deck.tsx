// Full-screen interactive pitch deck for Llave — 9 slides, ~2 min autoplay.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LlaveLogo } from "@/components/llave-logo";

type SlideTone = "dark" | "light";

type Slide = {
  id: string;
  durationMs: number;
  tone: SlideTone;
  render: () => React.ReactNode;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      variants={item}
      className="inline-flex items-center gap-2 self-start rounded-full border border-current/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] opacity-80"
    >
      {children}
    </motion.span>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      variants={item}
      className="font-display text-3xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl"
    >
      {children}
    </motion.h2>
  );
}

function Punch({ children, tone }: { children: React.ReactNode; tone: SlideTone }) {
  return (
    <motion.p
      variants={item}
      className={`mt-2 max-w-2xl text-base font-medium sm:text-lg ${
        tone === "dark"
          ? "text-[color:var(--color-accent)]"
          : "text-[color:var(--color-brand-700)]"
      }`}
    >
      {children}
    </motion.p>
  );
}

function NumberCard({
  big,
  label,
  tone,
}: {
  big: string;
  label: string;
  tone: SlideTone;
}) {
  return (
    <motion.div
      variants={item}
      className={`rounded-2xl border p-5 ${
        tone === "dark"
          ? "border-white/15 bg-white/5"
          : "border-[color:var(--color-brand-100)] bg-white"
      }`}
    >
      <div
        className={`font-display text-2xl font-bold sm:text-3xl ${
          tone === "dark"
            ? "text-[color:var(--color-accent)]"
            : "text-[color:var(--color-brand-700)]"
        }`}
      >
        {big}
      </div>
      <div className="mt-1 text-sm opacity-75">{label}</div>
    </motion.div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <motion.li variants={item} className="flex items-start gap-3 text-base sm:text-lg">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand-500)]" />
      <span>{children}</span>
    </motion.li>
  );
}

const SLIDES: Slide[] = [
  // 1 — Apertura
  {
    id: "apertura",
    durationMs: 12000,
    tone: "dark",
    render: () => (
      <motion.div
        variants={container}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          animate={{ rotate: [0, -6, 0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="text-[color:var(--color-accent)]"
        >
          <LlaveLogo className="size-28 sm:size-36" />
        </motion.div>
        <motion.h1
          variants={item}
          className="mt-6 font-display text-6xl font-bold sm:text-8xl"
        >
          Llave
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-3 max-w-xl text-lg text-white/80 sm:text-2xl"
        >
          Alquila en 24 horas. Sin papeles que no tienes.
        </motion.p>
        <motion.p
          variants={item}
          className="mt-6 text-xs uppercase tracking-[0.2em] text-white/45"
        >
          Platanus Build Night ft. Anthropic · Caracas 2026
        </motion.p>
      </motion.div>
    ),
  },
  // 2 — El problema
  {
    id: "problema",
    durationMs: 16000,
    tone: "light",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-7">
        <Kicker>El problema</Kicker>
        <Headline>
          Alquilar en Venezuela es un{" "}
          <span className="text-[color:var(--color-danger)]">muro</span>
        </Headline>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberCard big=">$800" label="antes de mudarte" tone="light" />
          <NumberCard big="1 a 2 sem" label="de espera" tone="light" />
          <NumberCard
            big="RIF + 5 fiadores"
            label="constancia + 2.5x del ingreso"
            tone="light"
          />
        </div>
        <Punch tone="light">
          El 60% de la economía es informal. No califica. Queda afuera.
        </Punch>
      </motion.div>
    ),
  },
  // 3 — La solución
  {
    id: "solucion",
    durationMs: 16000,
    tone: "dark",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-7">
        <Kicker>La solución</Kicker>
        <Headline>Llave entra por esa grieta</Headline>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberCard big="01" label="Solo cédula" tone="dark" />
          <NumberCard big="02" label="24 horas" tone="dark" />
          <NumberCard big="03" label="Cero depósito al inquilino" tone="dark" />
        </div>
        <Punch tone="dark">
          Del primer chat al contrato firmado en dos días.
        </Punch>
      </motion.div>
    ),
  },
  // 4 — Llavero IA
  {
    id: "llavero",
    durationMs: 16000,
    tone: "light",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-6">
        <Kicker>Llavero IA</Kicker>
        <Headline>
          Llavero — el agente que{" "}
          <span className="text-[color:var(--color-brand-500)]">entiende</span>, no
          interroga
        </Headline>
        <motion.p variants={item} className="text-sm font-medium opacity-70 sm:text-base">
          Construido sobre Claude Sonnet 4.5 · 12 herramientas que tocan datos reales
        </motion.p>
        <motion.ul variants={container} className="flex flex-col gap-3">
          <Bullet>Busca, recomienda y compara inmuebles</Bullet>
          <Bullet>Genera contratos LRCAV</Bullet>
          <Bullet>Registra pagos y arma el saldo</Bullet>
          <Bullet>Onboarding conversacional, sin formularios</Bullet>
        </motion.ul>
        <Punch tone="light">
          No alucina: cada respuesta sale de la base de datos.
        </Punch>
      </motion.div>
    ),
  },
  // 5 — Garantía Llave 360
  {
    id: "garantia",
    durationMs: 14000,
    tone: "dark",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-6">
        <Kicker>Garantía Llave 360°</Kicker>
        <Headline>Cero depósito. Llave responde.</Headline>
        <motion.p variants={item} className="max-w-2xl text-base opacity-80 sm:text-lg">
          El depósito legal (Art. 19 LRCAV) lo absorbe el Fondo Llave, no el inquilino.
        </motion.p>
        <motion.div variants={container} className="grid gap-3 sm:grid-cols-5">
          {[
            "Verificación previa",
            "Protocolo firmado",
            "Fondo Llave",
            "Gestión SUNAVI",
            "Supervisión",
          ].map((layer, i) => (
            <motion.div
              key={layer}
              variants={item}
              className="rounded-xl border border-white/15 bg-white/5 p-4"
            >
              <div className="font-display text-sm font-bold text-[color:var(--color-accent)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-1 text-sm opacity-85">{layer}</div>
            </motion.div>
          ))}
        </motion.div>
        <Punch tone="dark">
          El propietario duerme tranquilo. El inquilino entra sin barreras.
        </Punch>
      </motion.div>
    ),
  },
  // 6 — Trust Score
  {
    id: "trust-score",
    durationMs: 12000,
    tone: "light",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-7">
        <Kicker>Trust Score</Kicker>
        <Headline>Tu reputación reemplaza los papeles</Headline>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberCard big="+15" label="por cada pago a tiempo" tone="light" />
          <NumberCard big="+30" label="al cerrar contrato limpio" tone="light" />
        </div>
        <Punch tone="light">
          Un score que construyes alquilando — exportable como credencial verificable a
          la banca.
        </Punch>
      </motion.div>
    ),
  },
  // 7 — CRM para asesores
  {
    id: "crm",
    durationMs: 16000,
    tone: "dark",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-6">
        <Kicker>CRM para asesores</Kicker>
        <Headline>Un CRM que reparte oportunidades</Headline>
        <motion.ul variants={container} className="flex flex-col gap-3">
          <Bullet>Captación con cámara + LiDAR</Bullet>
          <Bullet>Publicación con IA</Bullet>
          <Bullet>Métricas reales: exposición, fuentes, conversión</Bullet>
          <Bullet>
            Integración con Meta y redes sociales: monitoreas y respondes todo desde un
            solo sitio
          </Bullet>
          <Bullet>
            Comisiones y el algoritmo Llave que premia al que responde rápido
          </Bullet>
        </motion.ul>
        <Punch tone="dark">
          Mientras mejor trabajas, más inmuebles te toca Llave.
        </Punch>
      </motion.div>
    ),
  },
  // 8 — El mercado
  {
    id: "mercado",
    durationMs: 14000,
    tone: "light",
    render: () => (
      <motion.div variants={container} className="flex flex-col gap-7">
        <Kicker>El mercado</Kicker>
        <Headline>
          <span className="text-[color:var(--color-brand-500)]">7 a 8 millones</span> de
          venezolanos viven fuera
        </Headline>
        <motion.p variants={item} className="max-w-2xl text-base opacity-80 sm:text-xl">
          Pagan alquiler a distancia. Recorren el inmueble en 3D antes de tomar un vuelo.
        </motion.p>
        <Punch tone="light">
          Más la economía informal local que nadie más atiende. Ese es el mercado de
          Llave.
        </Punch>
      </motion.div>
    ),
  },
  // 9 — Cierre
  {
    id: "cierre",
    durationMs: 8000,
    tone: "dark",
    render: () => (
      <motion.div
        variants={container}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          className="text-[color:var(--color-accent)]"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <LlaveLogo className="size-20 sm:size-24" />
        </motion.div>
        <motion.h1
          variants={item}
          className="mt-5 font-display text-6xl font-bold sm:text-8xl"
        >
          Llave
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-3 max-w-lg text-lg text-white/85 sm:text-2xl"
        >
          La llave que el modelo viejo te negaba.
        </motion.p>
        <motion.div
          variants={item}
          className="mt-6 flex flex-col items-center gap-1 text-sm"
        >
          <span className="font-semibold text-[color:var(--color-accent)]">
            llave-ruby.vercel.app
          </span>
          <span className="text-white/45">Hecho en Venezuela</span>
        </motion.div>
      </motion.div>
    ),
  },
];

const TOTAL_MS = SLIDES.reduce((acc, s) => acc + s.durationMs, 0);

export function PitchDeck() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  const slide = SLIDES[index];
  const dark = slide.tone === "dark";

  const exit = useCallback(() => router.push("/"), [router]);

  const go = useCallback((next: number) => {
    setIndex((prev) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
      if (clamped !== prev) setElapsed(0);
      return clamped;
    });
  }, []);

  const next = useCallback(() => {
    setIndex((prev) => {
      if (prev >= SLIDES.length - 1) {
        setPlaying(false);
        return prev;
      }
      setElapsed(0);
      return prev + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setPlaying(false);
    go(index - 1);
  }, [go, index]);

  const restart = useCallback(() => {
    setPlaying(false);
    setElapsed(0);
    setIndex(0);
  }, []);

  // Autoplay timer — per-slide duration, advances and stops at the end.
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const step = (now: number) => {
      const delta = now - start;
      setElapsed(delta);
      if (delta >= slide.durationMs) {
        next();
        return;
      }
      tickRef.current = requestAnimationFrame(step);
    };
    tickRef.current = requestAnimationFrame(step);
    return () => {
      if (tickRef.current !== null) cancelAnimationFrame(tickRef.current);
    };
  }, [playing, slide.durationMs, next, index]);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setPlaying(false);
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, exit]);

  const onClickArea = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const half = e.currentTarget.clientWidth / 2;
      setPlaying(false);
      if (e.clientX < half) prev();
      else next();
    },
    [next, prev],
  );

  const slideProgress = useMemo(
    () => Math.min(1, elapsed / slide.durationMs),
    [elapsed, slide.durationMs],
  );

  const deckProgress = useMemo(() => {
    const before = SLIDES.slice(0, index).reduce((a, s) => a + s.durationMs, 0);
    return Math.min(1, (before + elapsed) / TOTAL_MS);
  }, [index, elapsed]);

  return (
    <div
      className={`fixed inset-0 z-[120] flex flex-col overflow-hidden transition-colors duration-500 ${
        dark
          ? "bg-[color:var(--color-brand-900)] text-[color:var(--color-bg)]"
          : "bg-[color:var(--color-bg)] text-[color:var(--color-fg)]"
      }`}
    >
      {/* Top progress bar — full deck */}
      <div className="absolute inset-x-0 top-0 z-30 h-1 bg-current/10">
        <motion.div
          className="h-full bg-[color:var(--color-brand-500)]"
          animate={{ width: `${deckProgress * 100}%` }}
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
          onClick={restart}
          className="rounded-full border border-current/25 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-current/10"
        >
          Reiniciar
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

      {/* Per-slide thin progress (visible while playing) */}
      {playing && (
        <div className="absolute inset-x-0 top-1 z-20 h-0.5 bg-transparent">
          <div
            className="h-full bg-[color:var(--color-accent)]"
            style={{ width: `${slideProgress * 100}%` }}
          />
        </div>
      )}

      {/* Click navigation layer + slide content */}
      <div
        onClick={onClickArea}
        className="container-x flex flex-1 cursor-pointer items-center py-16"
      >
        <div className="mx-auto w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <motion.div initial="hidden" animate="visible" variants={container}>
                {slide.render()}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar — counter + dots */}
      <div className="relative z-30 flex items-center justify-between px-6 pb-6">
        <span className="font-display text-sm font-semibold tabular-nums opacity-70">
          {index + 1} / {SLIDES.length}
        </span>
        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setPlaying(false);
                go(i);
              }}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              className={`size-2.5 rounded-full transition ${
                i === index
                  ? "scale-125 bg-[color:var(--color-brand-500)]"
                  : "bg-current/25 hover:bg-current/45"
              }`}
            />
          ))}
        </div>
        <span className="hidden text-xs opacity-50 sm:block">
          {Math.round(TOTAL_MS / 1000)}s · flechas para navegar
        </span>
      </div>
    </div>
  );
}
