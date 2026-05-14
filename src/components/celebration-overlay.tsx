"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/**
 * Overlay de felicitación tras un alquiler. Copy según rol:
 *   - inquilino  → "¡Tu primera llave!" (o "¡Otra llave en tu llavero!")
 *   - asesor     → "¡Entregaste una llave!"
 *   - propietario→ "¡Tu inmueble está alquilado!"
 *
 * Confetti puro CSS (sin deps): N piezas con color, posición y delay
 * pseudo-aleatorios. Auto-dismiss a los 6s o con click.
 */

type Role = "inquilino" | "asesor" | "propietario";

const COPY: Record<
  Role,
  { first: { title: string; body: string }; repeat: { title: string; body: string } }
> = {
  inquilino: {
    first: {
      title: "¡Tienes tu primera llave!",
      body: "Bienvenido a Llave. Tu contrato está activo y tu Trust Score empezó a construirse. Cada pago a tiempo lo sube.",
    },
    repeat: {
      title: "¡Otra llave en tu llavero!",
      body: "Nuevo contrato activo. Tu historial de pagos puntuales te abre mejores inmuebles.",
    },
  },
  asesor: {
    first: {
      title: "¡Entregaste tu primera llave!",
      body: "Cerraste tu primer alquiler en Llave. Tu comisión ya está en camino y tu ranking de asesor sube.",
    },
    repeat: {
      title: "¡Entregaste una llave más!",
      body: "Otro cierre exitoso. Sigue así y entras al top 15% de asesores con beneficios premium.",
    },
  },
  propietario: {
    first: {
      title: "¡Tu inmueble está alquilado!",
      body: "Primer contrato firmado bajo Garantía Llave 360°. Llave responde por la propiedad; tú cobras tranquilo.",
    },
    repeat: {
      title: "¡Otro inmueble alquilado!",
      body: "Nuevo contrato activo en tu cartera. Revisa tu saldo y los pagos en tu panel.",
    },
  },
};

const CONFETTI_COLORS = ["#c4513a", "#e0856e", "#f4c95d", "#8a3722", "#f7d9cb"];

export function CelebrationOverlay({
  role,
  first = false,
  ctaHref,
  ctaLabel,
}: {
  role: Role;
  first?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [visible, setVisible] = useState(true);

  const copy = first ? COPY[role].first : COPY[role].repeat;

  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        // pseudo-random deterministic por índice
        const r = (n: number) => {
          const x = Math.sin(i * 9301 + n * 49297) * 233280;
          return x - Math.floor(x);
        };
        return {
          left: `${r(1) * 100}%`,
          delay: `${r(2) * 2.5}s`,
          duration: `${2.5 + r(3) * 2}s`,
          color: CONFETTI_COLORS[Math.floor(r(4) * CONFETTI_COLORS.length)],
          size: 6 + Math.floor(r(5) * 8),
          rotate: `${r(6) * 360}deg`,
        };
      }),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setVisible(false)}
      role="dialog"
      aria-modal="true"
    >
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="absolute top-[-20px] rounded-[2px]"
            style={{
              left: c.left,
              width: c.size,
              height: c.size * 1.6,
              background: c.color,
              transform: `rotate(${c.rotate})`,
              animation: `llave-confetti ${c.duration} linear ${c.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="relative mx-4 max-w-md rounded-[var(--radius-xl)] bg-white p-8 text-center shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[color:var(--color-brand-100)]">
          <KeyBurst />
        </div>
        <h2 className="font-display text-2xl font-bold leading-tight">{copy.title}</h2>
        <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
          {copy.body}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {ctaHref && (
            <Link href={ctaHref} className="btn btn-primary w-full">
              {ctaLabel ?? "Ver detalle"}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="btn btn-ghost w-full text-sm"
          >
            Continuar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes llave-confetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

function KeyBurst() {
  return (
    <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="var(--color-brand-700)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="8" cy="9" rx="4.2" ry="4.8" transform="rotate(-12 8 9)" />
      <circle cx="8" cy="9" r="1.3" fill="var(--color-brand-700)" stroke="none" />
      <path d="M8 13.8 V21 H21" />
      <path d="M14 21 V18.5" />
      <path d="M17.5 21 V19" />
    </svg>
  );
}
