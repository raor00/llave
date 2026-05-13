# Changelog

Sigue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) y [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Agregado
- `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE` en la raíz para discoverability — patrón inspirado en proyectos OSS maduros (referencia: graphify).

## [0.1.0] — 2026-05-13 · Platanus Hackathon Build Night

Primer corte del producto.

### Producto
- Marketplace de alquileres con 17 inmuebles seedeados en 8 ciudades venezolanas (Caracas, Maracaibo, Valencia, Barquisimeto, Mérida, Lechería, El Hatillo, San Antonio de los Altos).
- Filtros por ciudad, tipo, precio, ambientes; vista lista o mapa (Maplibre); comparador (hasta 4 inmuebles).
- Llavero IA — agente conversacional sobre Claude Sonnet 4.5 con 7 tools que tocan la DB real: `searchProperties`, `getPropertyDetail`, `recommendByProfile`, `compareProperties`, `scheduleVisit`, `createPropertyDraft`, `suggestPrice`.
- Modo voz: dictado + síntesis con Web Speech API.
- Modo offline: mock determinista que igual ejecuta las tools reales (sin pegarle a Claude).
- CRM asesor: dashboard, leads, publicación asistida por IA.
- Captación con cámara web (`/asesor/captacion`): multi-foto desde el dispositivo, drop-zone para tour 3D (`.splat`, `.ply`, USDZ, GLB).
- Tour 3D embebido: Gaussian Splat (gsplat) + `<model-viewer>` USDZ/GLB.
- Landing 3D con casa procedural en React Three Fiber, rotación con scroll.

### Diseño
- Paleta terracota caribeño (`#c4513a` primario, escala 50→900). Inicialmente esmeralda, pivote a terracota para no colisionar con Quarto y otros competidores verdes.
- Logo: monograma L-llave-con-casas. Bow orquídea hueco, caña vertical, espina, tres dientes-casa con techo a dos aguas decrecientes. Una sola tinta.
- OG image y favicon dinámicos vía `next/og`.
- Banner SVG committable + prompt gpt-image-2 1280x640 con cuatro chips ("Alquilá hoy", "0 meses adelantados", "1 mes depósito reembolsable", "Llavero IA").

### Infraestructura
- Next.js 16 App Router + Turbopack + React 19.
- Vercel AI SDK v6 con `@ai-sdk/anthropic` direct; fallback a AI Gateway; fallback a mock.
- Supabase SSR (Postgres + RLS + storage) con in-memory seed fallback.
- Vercel Analytics + Speed Insights cableados.
- Deploy auto desde `main` en GitHub.

### Tests
- Vitest + happy-dom — 29 aserciones en 3 suites (intent parser, schemas Zod de tools, queries seed-backed).

### Documentación
- Estructura completa en `docs/` en español: arquitectura, rutas, agente, modelo de datos, branding, anatomía del logo, estrategia de marca, testing, deployment, seguridad, roadmap, workflow de captura 3D, handoff prompt para retomar en otra sesión.
- Skill del proyecto en `.claude/skills/llave/SKILL.md` para Claude Code (auto-load).
- SDD-0001 documentado en `docs/sdd/0001-claude-live-and-tests/`.

### Seguridad
- Auditoría `cavecrew-reviewer` — blocker `/api/chat` (input validation) + RLS asesor demasiado permisiva fixed en `1d78609`. Medium diferidos en roadmap.

### Repo
- Publicado en https://github.com/raor00/llave (público).
- 13 commits limpios en `main`.
- Auto-deploy a Vercel desde `main`.
