import { describe, expect, test } from "vitest";
import { getPropertyById, searchProperties } from "@/lib/db/queries";
import { DEMO_PROPERTIES } from "@/lib/db/seed-data";

describe("searchProperties (seed-backed)", () => {
  test("returns disponible properties", async () => {
    const all = await searchProperties({});
    expect(all.length).toBeGreaterThanOrEqual(15);
  });

  test("filters by city (substring, case-insensitive)", async () => {
    const caracas = await searchProperties({ city: "Caracas" });
    expect(caracas.length).toBeGreaterThan(0);
    for (const p of caracas) expect(p.city.toLowerCase()).toContain("caracas");
  });

  test("filters by price_max", async () => {
    const cheap = await searchProperties({ price_max: 250 });
    expect(cheap.length).toBeGreaterThan(0);
    for (const p of cheap) expect(p.price_usd).toBeLessThanOrEqual(250);
  });

  test("filters by rooms_min", async () => {
    const threePlus = await searchProperties({ rooms_min: 3 });
    expect(threePlus.length).toBeGreaterThan(0);
    for (const p of threePlus) expect(p.rooms).toBeGreaterThanOrEqual(3);
  });

  test("filters by amenities (every keyword must match)", async () => {
    const piscina = await searchProperties({ amenities: ["piscina"] });
    expect(piscina.length).toBeGreaterThan(0);
    for (const p of piscina) {
      const amenityBlob = p.amenities.join(" ").toLowerCase();
      expect(amenityBlob).toContain("piscina");
    }
  });

  test("free-text query hits description / amenities / city", async () => {
    const planta = await searchProperties({ query: "planta" });
    expect(planta.length).toBeGreaterThan(0);
  });

  test("respects limit", async () => {
    const limited = await searchProperties({ limit: 3 });
    expect(limited.length).toBeLessThanOrEqual(3);
  });

  test("combined filters narrow the result set", async () => {
    const all = await searchProperties({});
    const narrowed = await searchProperties({
      city: "Caracas",
      type: "apartamento",
      price_max: 300,
    });
    expect(narrowed.length).toBeGreaterThan(0);
    expect(narrowed.length).toBeLessThan(all.length);
  });

  test("searchProperties devuelve coordenadas para renderizar el mapa", async () => {
    const properties = await searchProperties({ city: "Caracas", limit: 5 });
    expect(properties.length).toBeGreaterThan(0);
    expect(properties.some((p) => typeof p.lat === "number" && typeof p.lng === "number")).toBe(true);
  });

  test("seed expone el Loft Hackathon con tour GLB", async () => {
    const loft = DEMO_PROPERTIES.find((p) => p.title.includes("Loft Hackathon"));
    expect(loft).toBeTruthy();
    expect(loft?.tour_3d_url).toBe("/inmuebles/comedor/loft-hackathon-tour.glb");

    const detail = await getPropertyById(loft!.id);
    expect(detail?.tour_3d_url).toBe("/inmuebles/comedor/loft-hackathon-tour.glb");

    const matches = await searchProperties({ query: "Hackathon" });
    expect(matches.some((p) => p.title.includes("Loft Hackathon"))).toBe(true);
  });
});
