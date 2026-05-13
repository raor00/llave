import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById, getOwnerProfile } from "@/lib/db/queries";
import { formatPropertyType, formatUSD } from "@/lib/format";
import { Gallery } from "@/components/marketplace/gallery";
import { Tour3D } from "@/components/marketplace/tour-3d";
import { SplatViewer } from "@/components/marketplace/splat-viewer";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return notFound();
  const owner = await getOwnerProfile();

  const gallery = property.gallery_urls.length
    ? property.gallery_urls
    : property.cover_url
      ? [property.cover_url]
      : [];

  const chatHref = `/chat?context=${encodeURIComponent(
    `Quiero más info sobre el inmueble id=${property.id}: ${property.title}`
  )}`;

  return (
    <div className="container-x py-10">
      <Link href="/buscar" className="text-sm text-[color:var(--color-fg-muted)] hover:underline">
        ← Volver a inmuebles
      </Link>

      <div className="mt-4 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <Gallery images={gallery} title={property.title} />

          {property.splat_url && (
            <div className="mt-6">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-xl font-semibold">Tour 3D · Gaussian Splat</h2>
                <span className="chip">Recorré el ambiente</span>
              </div>
              <SplatViewer url={property.splat_url} title={property.title} />
            </div>
          )}

          {property.tour_3d_url && !property.splat_url && (
            <div className="mt-6">
              <h2 className="font-display text-xl font-semibold mb-3">Tour 3D</h2>
              <Tour3D url={property.tour_3d_url} title={property.title} />
            </div>
          )}

          <div className="mt-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="chip">{formatPropertyType(property.type)}</span>
              {property.no_months_upfront && (
                <span className="chip bg-[color:var(--color-accent)]/90 text-[color:var(--color-brand-900)] border-transparent">
                  Sin meses adelantados
                </span>
              )}
              <span className="chip chip-muted">Depósito {property.deposit_months} mes(es)</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              {property.title.replace(/^Llave:\s*/, "")}
            </h1>
            <div className="text-[color:var(--color-fg-muted)] mt-1">
              {property.address} · {property.city}, {property.state}
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Fact label="Habitaciones" value={property.rooms} />
              <Fact label="Baños" value={property.bathrooms} />
              {property.area_m2 ? <Fact label="Área" value={`${property.area_m2} m²`} /> : null}
              <Fact label="Estacionamiento" value={property.parking_spots || "—"} />
            </div>

            <h2 className="font-display text-xl font-semibold mt-10 mb-2">Descripción</h2>
            <p className="text-[color:var(--color-fg-muted)] leading-relaxed">{property.description}</p>

            {property.amenities.length > 0 && (
              <>
                <h2 className="font-display text-xl font-semibold mt-10 mb-3">Lo que incluye</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="chip chip-muted">{a}</span>
                  ))}
                </div>
              </>
            )}

            {property.rules.length > 0 && (
              <>
                <h2 className="font-display text-xl font-semibold mt-10 mb-3">Normas de la casa</h2>
                <ul className="text-[color:var(--color-fg-muted)] list-disc pl-5 space-y-1">
                  {property.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-6 sticky top-20">
            <div className="flex items-baseline justify-between">
              <div className="font-display text-3xl font-bold">{formatUSD(property.price_usd)}</div>
              <div className="text-sm text-[color:var(--color-fg-soft)]">/ mes</div>
            </div>
            <div className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
              Para entrar pagás solo <strong className="text-[color:var(--color-fg)]">{formatUSD(property.price_usd)}</strong> +
              depósito de <strong className="text-[color:var(--color-fg)]">{formatUSD(property.price_usd * property.deposit_months)}</strong> (reembolsable).
            </div>
            <div className="mt-3 rounded-lg bg-[color:var(--color-brand-50)] p-3 text-xs text-[color:var(--color-brand-700)]">
              En modelo tradicional pagarías ~{formatUSD(property.price_usd * 4)} antes de mudarte. En Llave: {formatUSD(property.price_usd * (1 + property.deposit_months))}.
            </div>
            <Link href={chatHref} className="btn btn-primary w-full mt-5">
              Preguntale a Llavero
            </Link>
            <Link href={chatHref + "&intent=visit"} className="btn btn-outline w-full mt-2">
              Agendar visita
            </Link>
          </div>

          <div className="card p-6">
            <div className="text-xs uppercase tracking-wide text-[color:var(--color-fg-soft)] mb-2">
              Asesor responsable
            </div>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center font-display text-lg">
                {owner.full_name?.[0] ?? "L"}
              </div>
              <div>
                <div className="font-semibold">{owner.full_name}</div>
                <div className="text-xs text-[color:var(--color-fg-soft)]">
                  ⭐ {owner.rating_avg.toFixed(2)} · {owner.rating_count} reseñas · Trust {owner.trust_score}
                </div>
              </div>
            </div>
            {owner.bio && <p className="text-sm text-[color:var(--color-fg-muted)] mt-3">{owner.bio}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-[color:var(--color-fg-soft)] uppercase tracking-wide">{label}</div>
      <div className="font-display text-xl font-semibold mt-0.5">{value}</div>
    </div>
  );
}
