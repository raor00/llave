"use client";

import { motion } from "motion/react";

// Static CRM mockup used on the landing to show the asesor experience as a
// complete platform: chat, leads, stats, social-network connections, ads.
// Built with divs so it scales with text and stays sharp on any DPI.

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
          <span>María R.</span>
          <span className="text-[10px] text-white/40">⭐ 4.85</span>
          <span className="size-7 rounded-full bg-[color:var(--color-brand-500)] flex items-center justify-center text-[10px] font-bold">MR</span>
        </div>
      </div>

      <div className="grid grid-cols-[56px_1fr]">
        {/* Sidebar */}
        <div className="border-r border-white/10 py-4 flex flex-col items-center gap-3 bg-black/20">
          <NavIcon icon="▣" active label="Dashboard" />
          <NavIcon icon="◉" label="Captación" />
          <NavIcon icon="✦" label="Publicar IA" />
          <NavIcon icon="◎" label="Leads" />
          <NavIcon icon="📣" label="Ads" />
          <NavIcon icon="📱" label="Redes" />
          <div className="flex-1" />
          <NavIcon icon="⌘" label="Cmd+K" muted />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 min-w-0">
          {/* Greeting + stats */}
          <div>
            <div className="text-[11px] text-white/50 uppercase tracking-wider">Lunes 13 may</div>
            <div className="font-display text-lg font-semibold text-white mt-1">Buenos días, María</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Stat n="17" l="Activos" />
            <Stat n="24" l="Leads mes" />
            <Stat n="50%" l="Conv." />
            <Stat n="$5.6k" l="Portafolio" />
          </div>

          {/* Mini chart */}
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <div className="flex items-end justify-between gap-1 h-12">
              {[18, 22, 30, 26, 38, 42, 36, 48, 44, 52, 60, 56].map((h, i) => (
                <motion.span
                  key={i}
                  initial={{ scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                  className="flex-1 origin-bottom rounded-sm bg-[color:var(--color-accent)]"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-2">
              <span>Leads esta semana</span>
              <span className="text-[color:var(--color-accent)]">+18%</span>
            </div>
          </div>

          {/* Two columns: leads + social */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/5 border border-white/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Leads recientes</div>
              <ul className="space-y-1.5 text-[11px]">
                <Lead name="Carlos González" status="agendado" tone="brand" />
                <Lead name="Ana López" status="nuevo" tone="blue" />
                <Lead name="Pedro Reyes" status="contactado" tone="amber" />
              </ul>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Redes conectadas</div>
              <ul className="space-y-1.5 text-[11px]">
                <Social icon="◆" name="Instagram" reach="12.4k" />
                <Social icon="◼" name="Facebook" reach="8.2k" />
                <Social icon="●" name="TikTok" reach="3.1k" />
              </ul>
            </div>
          </div>

          {/* Ads */}
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-white/40">Campañas Meta Ads</div>
              <span className="text-[10px] text-[color:var(--color-accent)]">2 activas</span>
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <Campaign name="Penthouse Altamira" spend="$24" clicks="142" />
              <Campaign name="Casa El Hatillo" spend="$11" clicks="67" />
            </ul>
          </div>

          {/* Chat preview */}
          <div className="rounded-lg bg-[color:var(--color-brand-900)]/70 border border-[color:var(--color-accent)]/30 p-3 flex items-start gap-3">
            <div className="size-7 rounded-full bg-[color:var(--color-brand-500)] flex items-center justify-center text-[10px] font-bold shrink-0">L</div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-white/50">Llavero IA</div>
              <div className="text-[11px] text-white/90 mt-1 leading-relaxed">
                Carlos González agendó visita para mañana 3pm. ¿Quieres que te prepare el mensaje de confirmación?
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NavIcon({ icon, label, active, muted }: { icon: string; label: string; active?: boolean; muted?: boolean }) {
  return (
    <div
      className={`size-9 rounded-lg flex items-center justify-center text-base ${
        active
          ? "bg-[color:var(--color-brand-500)] text-white"
          : muted
            ? "text-white/30"
            : "text-white/60 hover:text-white"
      }`}
      title={label}
    >
      {icon}
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-2">
      <div className="font-display text-base font-bold text-white leading-tight">{n}</div>
      <div className="text-[9px] uppercase tracking-wider text-white/50 mt-0.5">{l}</div>
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

function Social({ icon, name, reach }: { icon: string; name: string; reach: string }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2">
        <span className="size-4 rounded grid place-items-center text-white/70 text-[10px] bg-white/10">{icon}</span>
        <span className="text-white/90">{name}</span>
      </span>
      <span className="text-white/40 text-[10px]">{reach}</span>
    </li>
  );
}

function Campaign({ name, spend, clicks }: { name: string; spend: string; clicks: string }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-white/90 truncate">▣ {name}</span>
      <span className="text-white/40 text-[10px] shrink-0">{spend} · {clicks} clicks</span>
    </li>
  );
}
