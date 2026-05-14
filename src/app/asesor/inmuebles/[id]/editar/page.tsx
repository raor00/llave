/**
 * /asesor/inmuebles/[id]/editar — edición de un inmueble de la cartera.
 * Ruta compartida: tanto las filas del asesor como las del propietario
 * enlazan acá. Carga el inmueble, 404 si no existe, y renderiza el form.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/db/queries";
import { EditPropertyForm } from "@/components/inmuebles/edit-property-form";

export const dynamic = "force-dynamic";

export default async function EditarInmueblePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return notFound();

  return (
    <div className="container-x py-8 sm:py-10 space-y-6">
      <div>
        <span className="chip mb-2">Cartera · Editar</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Editar inmueble</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          Actualiza los datos de{" "}
          <strong className="text-[color:var(--color-fg)]">
            {property.title.replace(/^Llave:\s*/, "")}
          </strong>
          .
        </p>
        <Link
          href="/asesor/inmuebles"
          className="text-sm text-[color:var(--color-brand-700)] hover:underline mt-2 inline-block"
        >
          ← Volver a la cartera
        </Link>
      </div>

      <EditPropertyForm property={property} />
    </div>
  );
}
