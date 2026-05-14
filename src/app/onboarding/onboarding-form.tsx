"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setupProfile } from "./setup-action";

type Role = "inquilino" | "asesor" | "propietario";

const ROLES: Array<{
  value: Role;
  label: string;
  tag: string;
  body: string;
  icon: string;
  perks: string[];
}> = [
  {
    value: "inquilino",
    label: "Inquilino",
    tag: "Busco alquilar",
    icon: "🔍",
    body: "Vas a encontrar tu próximo inmueble con la ayuda de Llavero, agendar visitas y construir tu reputación de pagos.",
    perks: ["Búsqueda con IA", "Favoritos + comparador", "Tour 3D antes de visitar", "Sin meses adelantados"],
  },
  {
    value: "asesor",
    label: "Asesor de ventas",
    tag: "Manejo cartera",
    icon: "✦",
    body: "Captas inmuebles desde la cámara, los publicas con IA, recibes leads pre-calificados y promocionas en redes y Meta Ads.",
    perks: ["CRM completo", "Captación + Gaussian Splat", "Publicación asistida", "Leads + Meta Ads"],
  },
  {
    value: "propietario",
    label: "Propietario",
    tag: "Tengo inmueble",
    icon: "🏠",
    body: "Publicas tu inmueble con garantía Llave, recibes inquilinos verificados y revisas leads y desempeño desde tu panel.",
    perks: ["Garantía sobre tu inmueble", "Inquilinos verificados", "Stats y leads", "Cero papeleo"],
  },
];

export function OnboardingForm({ defaultName, email }: { defaultName: string; email: string }) {
  const [role, setRole] = useState<Role | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    if (!role) {
      toast.error("Elige un rol primero");
      return;
    }
    formData.set("role", role);
    startTransition(async () => {
      const res = await setupProfile(formData);
      if (res && !res.ok) toast.error(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const active = role === r.value;
          return (
            <button
              type="button"
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`card p-6 text-left transition relative ${
                active
                  ? "border-[color:var(--color-brand-500)] ring-2 ring-[color:var(--color-brand-300)] shadow-[var(--shadow-pop)] -translate-y-1"
                  : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
              }`}
            >
              <span className="text-3xl">{r.icon}</span>
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-[color:var(--color-fg-soft)]">{r.tag}</div>
                <div className="font-display text-2xl font-bold mt-0.5">{r.label}</div>
              </div>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-3 leading-relaxed">{r.body}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-[color:var(--color-fg)]">
                {r.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[color:var(--color-brand-500)]" />
                    {p}
                  </li>
                ))}
              </ul>
              {active && (
                <span className="absolute top-3 right-3 size-6 rounded-full bg-[color:var(--color-brand-500)] text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Nombre completo</label>
          <input
            required
            name="full_name"
            defaultValue={defaultName}
            placeholder="ej: María Rodríguez"
            className="input"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} disabled />
          </div>
          <div>
            <label className="label">Teléfono (opcional)</label>
            <input name="phone" placeholder="+58 412-1234567" className="input" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[color:var(--color-fg-soft)]">
          Tu rol determina qué dashboard ves al entrar. Lo puedes cambiar después.
        </p>
        <button
          type="submit"
          disabled={pending || !role}
          className="btn btn-primary px-8 py-3 text-base"
        >
          {pending ? "Guardando…" : "Entrar a Mi Llave"}
        </button>
      </div>
    </form>
  );
}
