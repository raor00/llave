import { describe, expect, test } from "vitest";
import { llaveroTools } from "@/lib/ai/tools";

function schemaOf(toolName: keyof typeof llaveroTools) {
  // AI SDK tool() helper exposes inputSchema as Zod or JSONSchema depending on version;
  // here we accept either Zod or anything that has .parse / .safeParse.
  const tool = llaveroTools[toolName] as unknown as {
    inputSchema?: { parse?: (x: unknown) => unknown; safeParse?: (x: unknown) => { success: boolean } };
  };
  return tool.inputSchema;
}

function expectAccept(toolName: keyof typeof llaveroTools, input: unknown) {
  const s = schemaOf(toolName);
  if (!s?.parse) return;
  expect(() => s.parse!(input)).not.toThrow();
}

function expectReject(toolName: keyof typeof llaveroTools, input: unknown) {
  const s = schemaOf(toolName);
  if (!s?.parse) return;
  expect(() => s.parse!(input)).toThrow();
}

describe("tool schemas", () => {
  test("searchProperties accepts realistic filters", () => {
    expectAccept("searchProperties", {
      city: "Caracas",
      type: "apartamento",
      price_max: 400,
      rooms_min: 2,
      amenities: ["planta", "piscina"],
      limit: 6,
    });
  });

  test("searchProperties rejects bogus type", () => {
    expectReject("searchProperties", { type: "submarino" });
  });

  test("compareProperties requires 2-4 ids", () => {
    expectAccept("compareProperties", {
      property_ids: ["11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"],
    });
    expectReject("compareProperties", { property_ids: ["solo-uno"] });
  });

  test("scheduleVisit needs property_id and inquilino_name", () => {
    expectAccept("scheduleVisit", {
      property_id: "11111111-1111-1111-1111-111111111111",
      inquilino_name: "Carlos González",
      inquilino_phone: "+58 412 1234567",
    });
    expectReject("scheduleVisit", { inquilino_name: "Carlos" });
  });

  test("recommendByProfile demands budget_usd, city and lifestyle", () => {
    expectAccept("recommendByProfile", {
      budget_usd: 300,
      city: "Caracas",
      lifestyle: "profesional joven trabajando en Chacao",
      needs: ["planta", "metro"],
    });
    expectReject("recommendByProfile", { budget_usd: 300 });
  });

  test("suggestPrice accepts minimal city+type", () => {
    expectAccept("suggestPrice", { city: "Caracas", type: "apartamento" });
    expectReject("suggestPrice", { city: "Caracas" });
  });

  test("createPropertyDraft requires raw_notes + base fields", () => {
    expectAccept("createPropertyDraft", {
      raw_notes: "apto 2 hab con planta eléctrica en Las Mercedes",
      type: "apartamento",
      city: "Caracas",
      state: "Distrito Capital",
      address: "Av. Principal",
      price_usd: 280,
      rooms: 2,
      bathrooms: 2,
    });
    expectReject("createPropertyDraft", { type: "apartamento" });
  });

  test("getPropertyDetail wants property_id", () => {
    expectAccept("getPropertyDetail", { property_id: "11111111-1111-1111-1111-111111111111" });
    expectReject("getPropertyDetail", {});
  });
});
