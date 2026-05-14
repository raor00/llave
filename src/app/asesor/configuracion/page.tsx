/**
 * /asesor/configuracion — Configuración del asesor.
 *
 * Form demo (no persiste): perfil, comisión por defecto, notificaciones,
 * integraciones sociales, toggles de Llavero IA y sesión. Los inputs son
 * server-rendered con valores default; cuando se conecte a Supabase se
 * convertirán a server actions con `upsert` a `profiles` y `asesor_settings`.
 */

import { getOwnerProfile } from "@/lib/db/queries";
import { signOutAction } from "@/components/user-menu-actions";
import { getGreeting } from "@/lib/greeting";
import {
  IconInstagram,
  IconFacebook,
  IconWhatsapp,
  IconTikTok,
  IconMeta,
} from "@/components/social-icons";
import { IconSettings, IconSparkle, IconCalendar } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

type IntegrationCard = {
  id: string;
  label: string;
  description: string;
  connected: boolean;
  icon: (props: { size?: number }) => React.JSX.Element;
  tint: string;
};

export default async function ConfiguracionPage() {
  const owner = await getOwnerProfile();
  const greeting = getGreeting(owner.full_name);

  const integrations: IntegrationCard[] = [
    {
      id: "instagram",
      label: "Instagram",
      description: "Publicar inmuebles y leer DMs como leads",
      connected: true,
      icon: (p) => <IconInstagram size={p.size ?? 16} />,
      tint: "text-[#e1306c]",
    },
    {
      id: "facebook",
      label: "Facebook",
      description: "Publicación cruzada con Marketplace",
      connected: true,
      icon: (p) => <IconFacebook size={p.size ?? 16} />,
      tint: "text-[#1877f2]",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business",
      description: "Llavero responde fuera de horario",
      connected: true,
      icon: (p) => <IconWhatsapp size={p.size ?? 16} />,
      tint: "text-[#25d366]",
    },
    {
      id: "tiktok",
      label: "TikTok",
      description: "Auto-publicar Reels generados por IA",
      connected: false,
      icon: (p) => <IconTikTok size={p.size ?? 16} />,
      tint: "text-[#0b1f1c]",
    },
    {
      id: "google_calendar",
      label: "Google Calendar",
      description: "Sincronizar visitas y recordatorios",
      connected: true,
      icon: (p) => <IconCalendar size={p.size ?? 16} />,
      tint: "text-[#f4b400]",
    },
    {
      id: "meta_ads",
      label: "Meta Ads",
      description: "Crear y pausar campañas desde Llave",
      connected: false,
      icon: (p) => <IconMeta size={p.size ?? 16} />,
      tint: "text-[#1877f2]",
    },
  ];

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header>
        <span className="chip mb-2">Cuenta · Configuración</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
          Ajusta tu perfil, comisión por defecto, notificaciones e integraciones. Todo se guarda contra tu cuenta de Llave.
        </p>
      </header>

      {/* Perfil */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Perfil de asesor</h2>
          <IconSettings size={16} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo" defaultValue={owner.full_name ?? ""} />
          <Field label="Email" defaultValue="rafa.oviedo2000@gmail.com" type="email" />
          <Field label="Teléfono" defaultValue={owner.phone ?? ""} />
          <Field label="Ciudad" defaultValue={owner.city ?? ""} />
          <div className="sm:col-span-2">
            <Label>Bio</Label>
            <textarea
              defaultValue={owner.bio ?? ""}
              rows={3}
              className="w-full rounded-md border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--color-brand-500)]"
            />
          </div>
          <Field label="Link bio (Linktree, IG, etc.)" defaultValue="https://llave.app/asesor/rafa" />
        </div>
        <div className="flex justify-end mt-5">
          <button type="button" className="btn btn-primary text-sm">Guardar perfil</button>
        </div>
      </section>

      {/* Comisión */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold mb-1">Comisión por defecto</h2>
        <p className="text-xs text-[color:var(--color-fg-muted)] mb-4">
          Se aplica a contratos nuevos que captes desde Llave. Puedes ajustar por contrato individual después.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={15}
            step={0.5}
            defaultValue={10}
            className="flex-1 accent-[color:var(--color-brand-500)]"
          />
          <div className="card px-4 py-2 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)] shrink-0">
            <span className="font-display text-2xl font-bold text-[color:var(--color-brand-700)]">10%</span>
          </div>
        </div>
        <div className="text-[11px] text-[color:var(--color-fg-soft)] mt-2">Rango sugerido en Venezuela: 8 - 12%</div>
      </section>

      {/* Notificaciones */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Notificaciones</h2>
        <ul className="divide-y divide-[color:var(--color-border)]">
          <SwitchRow label="Leads nuevos" hint="Email + WhatsApp en cuanto un inquilino te escriba" defaultChecked />
          <SwitchRow label="Visitas" hint="Recordatorio 1h antes y al confirmar" defaultChecked />
          <SwitchRow label="Oportunidades del algoritmo" hint="Cuando Llavero detecte una jugada importante" defaultChecked />
          <SwitchRow label="Comisiones cobradas" hint="Te avisamos cuando entra plata a tu cuenta" defaultChecked />
          <SwitchRow label="Reportes semanales" hint="Resumen ejecutivo cada lunes 9am" />
        </ul>
      </section>

      {/* Integraciones */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Integraciones</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((it) => {
            const Icon = it.icon;
            return (
              <article key={it.id} className="card p-4 flex items-start gap-3">
                <span className={`size-9 rounded-md bg-[color:var(--color-bg)] border border-[color:var(--color-border)] grid place-items-center shrink-0 ${it.tint}`}>
                  <Icon />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">{it.label}</h3>
                    <Switch defaultChecked={it.connected} />
                  </div>
                  <p className="text-[11px] text-[color:var(--color-fg-muted)] mt-0.5 leading-relaxed">{it.description}</p>
                  <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-1">
                    {it.connected ? "Conectado" : "Desconectado"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* API Llavero */}
      <section className="card p-5 sm:p-6 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="flex items-center gap-2 mb-3">
          <IconSparkle size={18} />
          <h2 className="font-display text-lg font-semibold">API de Llavero IA</h2>
        </div>
        <p className="text-xs text-[color:var(--color-fg-muted)] mb-4">
          Decide cuánto control le das al agente. Mientras más le actives, más cosas resuelve por ti.
        </p>
        <ul className="divide-y divide-[color:var(--color-brand-300)]">
          <SwitchRow
            label="Llavero responde leads fuera de horario"
            hint="De 7pm a 8am Llavero contesta en tu nombre. Te resume al día siguiente."
            defaultChecked
          />
          <SwitchRow
            label="Sugerir precios automáticamente"
            hint="Llavero analiza el mercado y propone ajustes cuando un inmueble queda estancado"
            defaultChecked
          />
          <SwitchRow
            label="Generar copy de redes"
            hint="Cada nuevo inmueble queda con post de Instagram + Facebook + TikTok listo para publicar"
            defaultChecked={false}
          />
        </ul>
      </section>

      {/* Sesión */}
      <section className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">Sesión</h2>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
            Sesión activa como <strong>{owner.full_name ?? "Asesor"}</strong>.
          </p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="btn btn-outline text-sm">
            Cerrar sesión
          </button>
        </form>
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold mb-1">
      {children}
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--color-brand-500)]"
      />
    </div>
  );
}

function SwitchRow({
  label,
  hint,
  defaultChecked = false,
}: {
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-[11px] text-[color:var(--color-fg-muted)] mt-0.5 leading-relaxed">{hint}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </li>
  );
}

function Switch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="block w-10 h-6 rounded-full bg-[color:var(--color-border)] peer-checked:bg-[color:var(--color-brand-500)] transition-colors" />
      <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
    </label>
  );
}
