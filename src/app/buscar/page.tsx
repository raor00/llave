import Link from "next/link";
import { MarketplaceFilters } from "@/components/marketplace/filters";
import { ResultsView } from "@/components/marketplace/results-view";
import { searchProperties } from "@/lib/db/queries";
import type { Property } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = {
  city?: string;
  type?: Property["type"];
  price_max?: string;
  price_min?: string;
  rooms_min?: string;
  q?: string;
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const params = await searchParams;
  const properties = await searchProperties({
    city: params.city,
    type: params.type,
    price_max: params.price_max ? Number(params.price_max) : undefined,
    price_min: params.price_min ? Number(params.price_min) : undefined,
    rooms_min: params.rooms_min ? Number(params.rooms_min) : undefined,
    query: params.q,
    limit: 48,
  });

  return (
    <div className="container-x py-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Inmuebles disponibles</h1>
          <p className="text-[color:var(--color-fg-muted)] mt-1">
            {properties.length} {properties.length === 1 ? "resultado" : "resultados"} ·{" "}
            todos publicados bajo el modelo Llave (sin meses adelantados)
          </p>
        </div>
        <Link href="/chat" className="btn btn-primary">Pídele a Llavero que busque por ti</Link>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <MarketplaceFilters />
        <div>
          {properties.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-display text-xl font-semibold">Sin resultados con esos filtros</h3>
              <p className="text-[color:var(--color-fg-muted)] mt-1">
                Probá ampliar el presupuesto o cambiar la ciudad. O dejá que Llavero te ayude.
              </p>
              <Link href="/chat" className="btn btn-primary mt-4">Hablar con Llavero</Link>
            </div>
          ) : (
            <ResultsView properties={properties} />
          )}
        </div>
      </div>
    </div>
  );
}
