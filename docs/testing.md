# Testing

## Qué testeamos

Tres suites de Vitest cubren la lógica que no se ve desde la UI y que es más propensa a regresar:

1. **`tests/local-mock-model.test.ts`** — extracción de entidades (city, type, rooms, price max, amenities, uuid) y ruteo de intent para `searchProperties`, `recommendByProfile`, `compareProperties`, `scheduleVisit`, `createPropertyDraft`, `suggestPrice`.
2. **`tests/tools.test.ts`** — los schemas de input Zod de las 7 tools de Llavero aceptan fixtures realistas y rechazan inválidos obvios (1 solo id para compare, sin contacto para schedule, sin `lifestyle` para recommend, etc).
3. **`tests/queries.test.ts`** — `searchProperties` sobre seed respeta cada filtro (city, price_max, rooms_min, amenities, texto libre), `limit` y combinaciones.

Estado actual: **3 suites, 29 aserciones, todas pasando**.

## Qué deliberadamente NO testeamos

- Componentes React (no compensa para el alcance del hackathon).
- El dev server en sí (`next build` / `next start` ya cubre el wire-up).
- RLS de Supabase (requeriría Postgres real en CI; el path que ejercitamos es el seed).
- El favicon dinámico ni la OG (review visual).
- La escena R3F del hero (review visual).

## Cómo correr

```bash
pnpm test           # one-shot
pnpm test:watch     # watch mode
pnpm test:ui        # UI de Vitest en el browser
```

CI corre `pnpm typecheck && pnpm test`.

## Configuración

`vitest.config.ts` aliasa `@` a `./src`, environment `happy-dom`, incluye `tests/**/*.test.{ts,tsx}`.

## Cómo escribir nuevos tests

- Viven en `tests/`. Importá desde `@/lib/...` (mismo path que el runtime).
- Preferí funciones puras cuando sea posible — extraé lógica de los componentes para poder testearla sin renderizar.
- Una aserción por concepto. Agrupá aserciones relacionadas en un `describe`.
- Usá el seed (`@/lib/db/seed-data`) como fixture. No fabriques fixtures nuevos a mano salvo que el seed no pueda representar el caso.

## Cuándo agregar test antes de cambiar código

- Agregar una nueva tool a `llaveroTools`: escribí el test de schema primero (caso aceptado + caso rechazado).
- Agregar un nuevo filtro a `searchProperties`: escribí la aserción sobre el seed primero.
- Agregar un nuevo intent al mock: escribí el caso de `detectIntent` primero.

No es TDD estricto en todo el codebase, pero en estos tres módulos paga la próxima vez que el parser se desvía.
