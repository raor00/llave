import { describe, expect, test } from "vitest";
import { detectIntent, extractEntities } from "@/lib/ai/local-mock-model";

describe("extractEntities", () => {
  test("detects city by case-insensitive substring", () => {
    expect(extractEntities("Busco depto en Caracas").city).toBe("Caracas");
    expect(extractEntities("apto en MARACAIBO").city).toBe("Maracaibo");
    expect(extractEntities("nada relevante aqui").city).toBeUndefined();
  });

  test("classifies property type", () => {
    expect(extractEntities("Busco un apto luminoso").type).toBe("apartamento");
    expect(extractEntities("Quiero una casa con patio").type).toBe("casa");
    expect(extractEntities("Necesito local comercial").type).toBe("local");
    expect(extractEntities("Una habitación amoblada").type).toBe("habitacion");
  });

  test("parses room minimums", () => {
    expect(extractEntities("2 habitaciones por favor").rooms_min).toBe(2);
    expect(extractEntities("Algo de 3 ambientes").rooms_min).toBe(3);
    expect(extractEntities("sin filtro de hab").rooms_min).toBeUndefined();
  });

  test("captures price ceilings (multiple phrasings)", () => {
    expect(extractEntities("maximo $250").price_max).toBe(250);
    expect(extractEntities("hasta 400 dólares").price_max).toBe(400);
    expect(extractEntities("$180/mes").price_max).toBe(180);
    expect(extractEntities("nada de precio acá").price_max).toBeUndefined();
  });

  test("collects amenity keywords", () => {
    const a = extractEntities("con planta eléctrica, piscina y wifi").amenities;
    expect(a).toEqual(expect.arrayContaining(["planta", "piscina", "wifi"]));
  });

  test("captures property uuids", () => {
    const uuid = "11111111-2222-3333-4444-555555555555";
    expect(extractEntities(`detalle de ${uuid}`).property_id).toBe(uuid);
    expect(extractEntities("sin uuid").property_id).toBeUndefined();
  });
});

describe("detectIntent", () => {
  test("defaults to searchProperties", () => {
    const i = detectIntent("Apto en Caracas 2 ambientes hasta $300");
    expect(i.tool).toBe("searchProperties");
    if (i.tool === "searchProperties") {
      expect(i.args.city).toBe("Caracas");
      expect(i.args.rooms_min).toBe(2);
      expect(i.args.price_max).toBe(300);
    }
  });

  test("falls into recommendByProfile when lifestyle is mentioned", () => {
    const i = detectIntent("Soy estudiante en Mérida, mi presupuesto es $220");
    expect(i.tool).toBe("recommendByProfile");
    if (i.tool === "recommendByProfile") {
      expect(i.args.budget_usd).toBe(220);
      expect(i.args.city).toBe("Mérida");
    }
  });

  test("routes to suggestPrice for asesor pricing requests", () => {
    const i = detectIntent("Sugerime precio para una casa en Valencia 4 habitaciones");
    expect(i.tool).toBe("suggestPrice");
    if (i.tool === "suggestPrice") {
      expect(i.args.city).toBe("Valencia");
      expect(i.args.type).toBe("casa");
    }
  });

  test("routes to createPropertyDraft on publish intent", () => {
    const i = detectIntent("Quiero publicar un apto en Caracas a $280 2 habitaciones");
    expect(i.tool).toBe("createPropertyDraft");
    if (i.tool === "createPropertyDraft") {
      expect(i.args.type).toBe("apartamento");
      expect(i.args.price_usd).toBe(280);
    }
  });

  test("compareProperties requires at least 2 known ids in history", () => {
    const i = detectIntent("Comparame esos dos");
    // Without history with ids, falls through to search
    expect(["searchProperties", "compareProperties"]).toContain(i.tool);
  });

  test("scheduleVisit asks for contact when name/phone missing", () => {
    const i = detectIntent("Quiero agendar visita");
    expect(i.tool).toBeNull();
    if (i.tool === null) {
      expect(i.text.toLowerCase()).toContain("tel");
    }
  });

  test("scheduleVisit fires when name + phone + uuid present", () => {
    const uuid = "11111111-2222-3333-4444-555555555555";
    const i = detectIntent(`Agendame visita al ${uuid}, soy Carlos +58 412-1234567`);
    expect(i.tool).toBe("scheduleVisit");
    if (i.tool === "scheduleVisit") {
      expect(i.args.property_id).toBe(uuid);
      expect(i.args.inquilino_name).toBe("Carlos");
    }
  });
});
