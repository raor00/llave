/**
 * /propietario/configuracion — configuración del propietario. Form demo (no
 * persiste): perfil, preferencias de cobro, notificaciones, Garantía Llave 360°
 * y sesión. Espeja la estructura de /asesor/configuracion adaptada al dueño;
 * cuando suba Supabase los inputs pasan a server actions sobre `profiles`.
 */

import { getOwnerProfile } from "@/lib/db/queries";
import { signOutAction } from "@/components/user-menu-actions";
import { getGreeting } from "@/lib/greeting";
import { IconSettings, IconCash, IconSparkle } from "@/components/dashboard-icons";

export const dynamic = "force-dynamic";

export default async function PropietarioConfiguracionPage() {
  const owner = await getOwnerProfile();
  const greeting = getGreeting(owner.full_name);

  return (
    <div className="container-x py-8 sm:py-10 space-y-8">
      <header>
        <span className="chip mb-2">Cuenta · Configuración</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{greeting.full}</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-2xl">
          Ajusta tu perfil, preferencias de cobro, notificaciones y la Garantía Llave. Todo se guarda contra tu cuenta.
        </p>
      </header>

      {/* Perfil */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Perfil de propietario</h2>
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
        </div>
        <div className="flex justify-end mt-5">
          <button type="button" className="btn btn-primary text-sm">Guardar perfil</button>
        </div>
      </section>

      {/* Preferencias de cobro */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display text-lg font-semibold">Preferencias de cobro</h2>
          <IconCash size={16} />
        </div>
        <p className="text-xs text-[color:var(--color-fg-muted)] mb-4">
          Define cómo y cuándo quieres recibir los pagos de tus inquilinos.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Método preferido</Label>
            <select
              defaultValue="pago_movil"
              className="w-full rounded-md border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--color-brand-500)]"
            >
              <option value="transferencia">Transferencia bancaria</option>
              <option value="pago_movil">Pago móvil</option>
              <option value="zelle">Zelle</option>
              <option value="binance">Binance</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
          <div>
            <Label>Día de corte</Label>
            <input
              type="number"
              min={1}
              max={28}
              defaultValue={5}
              className="w-full rounded-md border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--color-brand-500)]"
            />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button type="button" className="btn btn-primary text-sm">Guardar preferencias</button>
        </div>
      </section>

      {/* Notificaciones */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Notificaciones</h2>
        <ul className="divide-y divide-[color:var(--color-border)]">
          <SwitchRow label="Pago recibido" hint="Te avisamos en cuanto un inquilino registra un pago" defaultChecked />
          <SwitchRow label="Pago atrasado" hint="Alerta cuando un inquilino pasa el día de corte sin pagar" defaultChecked />
          <SwitchRow label="Nuevo lead" hint="Cuando alguien muestra interés en uno de tus inmuebles" defaultChecked />
          <SwitchRow label="Contrato por vencer" hint="Aviso 60 días antes de que termine un contrato" defaultChecked />
          <SwitchRow label="Reporte mensual" hint="Resumen ejecutivo de tu cartera cada mes" />
        </ul>
      </section>

      {/* Garantía Llave 360 */}
      <section className="card p-5 sm:p-6 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-300)]">
        <div className="flex items-center gap-2 mb-3">
          <IconSparkle size={18} />
          <h2 className="font-display text-lg font-semibold">Garantía Llave 360°</h2>
        </div>
        <p className="text-xs text-[color:var(--color-fg-muted)] mb-4 leading-relaxed">
          Llave cubre daños no estructurales y hasta 1 mes de mora. Tus inquilinos llegan pre-calificados por Llavero.
          Actívala en toda tu cartera para máxima protección.
        </p>
        <ul className="divide-y divide-[color:var(--color-brand-300)]">
          <SwitchRow
            label="Activar Garantía en todos mis inmuebles"
            hint="Cada inmueble nuevo queda protegido automáticamente"
            defaultChecked
          />
        </ul>
      </section>

      {/* Sesión */}
      <section className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">Sesión</h2>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
            Sesión activa como <strong>{owner.full_name ?? "Propietario"}</strong>.
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
