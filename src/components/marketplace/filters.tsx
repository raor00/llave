"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const CITIES = ["Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Mérida", "Lechería", "El Hatillo", "San Antonio", "Chacao"];
const TYPES: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos" },
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "habitacion", label: "Habitación" },
  { value: "local", label: "Local" },
];

export function MarketplaceFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [city, setCity] = useState(sp.get("city") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [priceMax, setPriceMax] = useState(sp.get("price_max") ?? "");
  const [roomsMin, setRoomsMin] = useState(sp.get("rooms_min") ?? "");
  const [query, setQuery] = useState(sp.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (type) params.set("type", type);
      if (priceMax) params.set("price_max", priceMax);
      if (roomsMin) params.set("rooms_min", roomsMin);
      if (query) params.set("q", query);
      router.replace(`/buscar?${params.toString()}`, { scroll: false });
    }, 220);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, type, priceMax, roomsMin, query]);

  return (
    <aside className="card p-5 sticky top-20">
      <div className="space-y-4">
        <div>
          <label className="label">Buscar</label>
          <input
            className="input"
            placeholder="ej: planta eléctrica, balcón…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Ciudad</label>
          <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Todas</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Precio máximo (USD/mes)</label>
          <input
            type="number"
            className="input"
            placeholder="500"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Habitaciones mín.</label>
          <select className="input" value={roomsMin} onChange={(e) => setRoomsMin(e.target.value)}>
            <option value="">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-outline w-full mt-5"
        onClick={() => {
          setCity("");
          setType("");
          setPriceMax("");
          setRoomsMin("");
          setQuery("");
        }}
      >
        Limpiar filtros
      </button>
    </aside>
  );
}
