"use client";

import { motion } from "motion/react";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsapp,
  IconMeta,
} from "@/components/social-icons";
import {
  IconDashboard,
  IconLeads,
  IconContacts,
  IconCalendar,
  IconMessage,
  IconProperties,
  IconSparkle,
  IconReport,
  IconCash,
  IconMegaphone,
} from "@/components/dashboard-icons";

/**
 * Mockup del CRM mostrado en la landing (#asesores). Refleja el dashboard
 * real del asesor: sidebar con los módulos vivos, stats de comisiones,
 * "Exposición esta semana" + tendencia, fuentes de tráfico y una
 * oportunidad del algoritmo Llave. Todo con transiciones scroll-driven
 * para que se sienta una herramienta en movimiento, coherente con
 * /asesor en producción.
 */

const SIDEBAR = [
  { Icon: IconDashboard, label: "Dashboard", active: true },
  { Icon: IconLeads, label: "Leads" },
  { Icon: IconContacts, label: "Contactos" },
  { Icon: IconCalendar, label: "Visitas" },
  { Icon: IconMessage, label: "Mensajes" },
  { Icon: IconProperties, label: "Inmuebles" },
  { Icon: IconSparkle, label: "Publicar IA" },
  { Icon: IconReport, label: "Reportes" },
  { Icon: IconCash, label: "Comisiones" },
  { Icon: IconMegaphone, label: "Marketing" },
];

// Tendencia de exposición (vistas/día, 7 días) — mismo shape que el chart real.
const TREND = [42, 58, 51, 73, 66, 88, 79];
const TREND_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

// Fuentes de tráfico — porcentaje y color de marca.
const SOURCES = [
  { name: "Instagram", pct: 34, color: "#e1306c", Icon: IconInstagram },
  { name: "Llavero IA", pct: 24, color: "#e0856e", Icon: null },
  { name: "Facebook", pct: 18, color: "#1877f2", Icon: IconFacebook },
  { name: "WhatsApp", pct: 14, color: "#25d366", Icon: IconWhatsapp },
  { name: "TikTok", pct: 10, color: "#ffffff", Icon: IconTikTok },
];

export function CrmMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, rotateX: 4 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      className="rounded-[var(--radius-xl)] bg-[#0b1f1c] text-white shadow-[var(--shadow-pop)] border border-white/10 overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f56]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#27c93f]" />
          <span className="ml-3 text-xs text-white/60">llave.app/asesor</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span className="hidden sm:inline">Rafael O.</span>
          <span className="text-[9px] uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded">Asesor</span>
          <span className="size-7 rounded-full bg-[color:var(--color-brand-500)] flex items-center justify-center text-[10px] font-bold">RO</span>
        </div>
      </div>

      <div className="grid grid-cols-[52px_1fr]">
        {/* Sidebar — refleja los módulos reales */}
        <div className="border-r border-white/10 py-3 flex flex-col items-center gap-1.5 bg-black/20">
          {SIDEBAR.map(({ Icon, label, active }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.4 }}
              className={`size-8 rounded-lg flex items-center justify-center ${
                active
                  ? "bg-[color:var(--color-brand-500)] text-white"
                  : "text-white/45"
              }`}
              title={label}
            >
              <Icon size={16} />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 min-w-0">
          {/* Greeting */}
          <div>
            <div className="text-[11px] text-white/50 uppercase tracking-wider">Panel asesor · CRM Llave</div>
            <div className="font-display text-lg font-semibold text-white mt-0.5">Buenas tardes, Rafael</div>
          </div>

          {/* Stats — mismos labels que el dashboard real */}
          <div className="grid grid-cols-4 gap-2">
            <Stat n="$1.2k" l="Cobrado mes" />
            <Stat n="$8.4k" l="Este año" />
            <Stat n="4" l="Alquilados" />
            <Stat n="71" l="Interés" highlight />
          </div>

          {/* Exposición esta semana + tendencia */}
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-white/50">Exposición esta semana</span>
              <span className="text-[10px] text-[color:var(--color-accent)]">+22%</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              <Pill n="486" l="Vistas" />
              <Pill n="312" l="Únicos" />
              <Pill n="174" l="Clicks" />
              <Pill n="38" l="CTA" />
            </div>
            <div className="flex items-end justify-between gap-1.5 h-14">
              {TREND.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.span
                    initial={{ scaleY: 0, opacity: 0 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                    className="w-full origin-bottom rounded-sm bg-gradient-to-t from-[color:var(--color-brand-700)] to-[color:var(--color-accent)]"
                    style={{ height: `${(h / 88) * 100}%` }}
                  />
                  <span className="text-[8px] text-white/35">{TREND_DAYS[i]}</span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-white/40 mt-1.5">Tendencia de vistas · últimos 7 días</div>
          </div>

          {/* Fuentes de tráfico + leads */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/5 border border-white/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Fuentes de tráfico</div>
              <ul className="space-y-1.5">
                {SOURCES.map((s, i) => (
                  <li key={s.name}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="flex items-center gap-1 text-white/85">
                        {s.Icon ? <s.Icon size={9} /> : <span className="font-bold">L</span>}
                        {s.name}
                      </span>
                      <span className="text-white/45">{s.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: s.color }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Leads recientes</div>
              <ul className="space-y-1.5 text-[11px]">
                <Lead name="Carlos González" status="agendado" tone="brand" />
                <Lead name="Ana López" status="nuevo" tone="blue" />
                <Lead name="Pedro Reyes" status="contactado" tone="amber" />
                <Lead name="María Pérez" status="firmado" tone="brand" />
              </ul>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-white/40">Conversión</span>
                <span className="text-[color:var(--color-accent)] font-semibold">50%</span>
              </div>
            </div>
          </div>

          {/* Oportunidad del algoritmo Llave */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="rounded-lg bg-[color:var(--color-brand-900)]/80 border border-[color:var(--color-accent)]/30 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-accent)] font-bold">
                Algoritmo Llave
              </span>
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-semibold">+12% conversión</span>
            </div>
            <div className="text-[11px] text-white/90 leading-relaxed">
              Tienes 2 leads sin responder hace 4h. Responder en &lt;1h te sube en el ranking de asesores.
            </div>
          </motion.div>

          {/* Campañas Meta Ads */}
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="size-5 rounded grid place-items-center bg-[#1877f2]/15 text-[#7eb6ff]">
                  <IconMeta size={12} />
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/60">Campañas Meta Ads</span>
              </div>
              <span className="text-[10px] text-[color:var(--color-accent)]">2 activas</span>
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <Campaign name="Penthouse Altamira" platform="instagram" spend="$24" clicks="142" />
              <Campaign name="Casa El Hatillo" platform="facebook" spend="$11" clicks="67" />
            </ul>
          </div>

          {/* Chat preview */}
          <div className="rounded-lg bg-[color:var(--color-brand-900)]/70 border border-[color:var(--color-accent)]/30 p-3 flex items-start gap-3">
            <div className="size-7 rounded-full bg-[color:var(--color-brand-500)] flex items-center justify-center text-[10px] font-bold shrink-0">L</div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-white/50">Llavero IA</div>
              <div className="text-[11px] text-white/90 mt-1 leading-relaxed">
                Carlos González agendó visita para mañana 3pm. ¿Quieres que prepare el mensaje de confirmación?
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ n, l, highlight }: { n: string; l: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2.5 py-2 border ${
        highlight
          ? "bg-[color:var(--color-brand-500)]/20 border-[color:var(--color-accent)]/40"
          : "bg-white/5 border-white/5"
      }`}
    >
      <div className="font-display text-base font-bold text-white leading-tight">{n}</div>
      <div className="text-[9px] uppercase tracking-wider text-white/50 mt-0.5">{l}</div>
    </div>
  );
}

function Pill({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-md bg-white/5 px-2 py-1.5 text-center">
      <div className="font-display text-sm font-bold text-white leading-none">{n}</div>
      <div className="text-[8px] uppercase tracking-wider text-white/45 mt-0.5">{l}</div>
    </div>
  );
}

function Lead({ name, status, tone }: { name: string; status: string; tone: "brand" | "blue" | "amber" }) {
  const dot =
    tone === "brand"
      ? "bg-[color:var(--color-accent)]"
      : tone === "blue"
        ? "bg-sky-400"
        : "bg-amber-400";
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 min-w-0">
        <span className={`size-1.5 rounded-full ${dot}`} />
        <span className="truncate text-white/90">{name}</span>
      </span>
      <span className="text-white/40 text-[10px]">{status}</span>
    </li>
  );
}

function Campaign({
  name,
  platform,
  spend,
  clicks,
}: {
  name: string;
  platform: "instagram" | "facebook";
  spend: string;
  clicks: string;
}) {
  const Icon = platform === "instagram" ? IconInstagram : IconFacebook;
  const tint = platform === "instagram" ? "text-[#f48fb1]" : "text-[#7eb6ff]";
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 min-w-0">
        <span className={`size-5 rounded grid place-items-center bg-white/10 ${tint}`}>
          <Icon size={11} />
        </span>
        <span className="text-white/90 truncate">{name}</span>
      </span>
      <span className="text-white/40 text-[10px] shrink-0">
        {spend} · {clicks}
      </span>
    </li>
  );
}
