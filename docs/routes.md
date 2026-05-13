# Mapa de rutas

## Marketing público + marketplace

| Ruta | Archivo | Tipo | Qué muestra |
|------|---------|------|-------------|
| `/` | `src/app/page.tsx` | RSC | Landing: hero 3D, el problema, manifiesto, destacados, teaser del agente, roadmap |
| `/buscar` | `src/app/buscar/page.tsx` | RSC | Marketplace: panel de filtros, toggle lista/mapa, drawer comparador, grid de resultados |
| `/inmueble/[id]` | `src/app/inmueble/[id]/page.tsx` | RSC | Detalle: galería, fichas, descripción, amenities, normas, ficha del asesor, sidebar pegajoso con CTA |
| `/chat` | `src/app/chat/page.tsx` | Cliente (Suspense) | UI de Llavero con render de tool results y voz |
| `/login` | `src/app/login/page.tsx` | Cliente | Auth de Supabase por magic link |

## Asesor / CRM (gateado por rol vía RLS en DB)

| Ruta | Archivo | Tipo | Qué muestra |
|------|---------|------|-------------|
| `/asesor` | `src/app/asesor/page.tsx` | RSC | Dashboard: tarjetas de stats (activos, leads, conversión, portafolio), tabla de inmuebles |
| `/asesor/leads` | `src/app/asesor/leads/page.tsx` | RSC | Tarjetas de lead con estado, contacto y resumen del agente |
| `/asesor/publicar` | `src/app/asesor/publicar/page.tsx` | Cliente (Suspense) | El mismo `ChatWindow` en `asesorMode` para el flujo de publicar con IA |

## API

| Ruta | Archivo | Runtime | Comportamiento |
|------|---------|---------|----------------|
| `POST /api/chat` | `src/app/api/chat/route.ts` | Node, maxDuration 60 | Stream del AI SDK. Valida el body, elige modelo (Anthropic directo → AI Gateway → mock), expone `llaveroTools` |

## Assets

| Ruta | Archivo | Runtime | Comportamiento |
|------|---------|---------|----------------|
| `/opengraph-image` | `src/app/opengraph-image.tsx` | Edge | OG dinámica 1200x630 (next/og) |
| `/icon` | `src/app/icon.tsx` | Edge | Favicon dinámico 64x64 |

## Middleware

| Archivo | Comportamiento |
|---------|----------------|
| `src/middleware.ts` + `src/lib/supabase/middleware.ts` | Llama a `supabase.auth.getUser()` para refrescar cookies de sesión en cada request no estática. No-op cuando falta env de Supabase. |

## Query params que usa `/buscar`

- `city` — match por substring
- `state` — match por substring
- `type` — uno de `apartamento`, `casa`, `local`, `edificio`, `habitacion`
- `price_min`, `price_max` — números
- `rooms_min` — número
- `q` — texto libre → full-text en Supabase, fallback ilike sobre el seed

`/chat` acepta `?context=...` y `?intent=visit` para precargar un mensaje cuando se llega desde un detalle de inmueble.
