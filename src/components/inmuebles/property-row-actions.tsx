"use client";

/**
 * Celda de acciones por inmueble para las tablas de cartera (asesor +
 * propietario): menú compacto con Ver, Editar y cambios de estado segun el
 * estado actual del inmueble. Cada cambio de estado corre en una transición
 * y refresca la ruta al terminar.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { setPropertyStatusAction } from "@/app/_actions/properties";
import { IconDots, IconEdit, IconEye, IconCheck } from "@/components/dashboard-icons";
import type { Property } from "@/lib/types";

type StatusOption = { label: string; status: Property["status"] };

function statusOptionsFor(status: Property["status"]): StatusOption[] {
  switch (status) {
    case "disponible":
      return [
        { label: "Marcar como alquilado", status: "alquilado" },
        { label: "Marcar como reservado", status: "reservado" },
        { label: "Pausar", status: "pausado" },
      ];
    case "alquilado":
    case "reservado":
      return [{ label: "Marcar como disponible", status: "disponible" }];
    case "pausado":
      return [{ label: "Reactivar", status: "disponible" }];
    default:
      return [];
  }
}

export function PropertyRowActions({
  propertyId,
  status,
}: {
  propertyId: string;
  status: Property["status"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const options = statusOptionsFor(status);

  function applyStatus(next: Property["status"]) {
    startTransition(async () => {
      const res = await setPropertyStatusAction(propertyId, next);
      if (res.ok) {
        toast.success("Estado actualizado");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div ref={wrapRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Acciones del inmueble"
        className="btn btn-ghost !px-2 !py-1.5 disabled:opacity-50"
      >
        <IconDots size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-[color:var(--color-border)] bg-white shadow-lg p-1.5 text-sm"
        >
          <Link
            href={`/inmueble/${propertyId}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[color:var(--color-brand-50)] transition"
          >
            <IconEye size={16} />
            Ver
          </Link>
          <Link
            href={`/asesor/inmuebles/${propertyId}/editar`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[color:var(--color-brand-50)] transition"
          >
            <IconEdit size={16} />
            Editar
          </Link>

          {options.length > 0 && (
            <div className="my-1 border-t border-[color:var(--color-border)]" />
          )}

          {options.map((opt) => (
            <button
              key={opt.status}
              type="button"
              role="menuitem"
              disabled={pending}
              onClick={() => applyStatus(opt.status)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left hover:bg-[color:var(--color-brand-50)] disabled:opacity-50 transition"
            >
              <IconCheck size={16} />
              {pending ? "Actualizando…" : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
