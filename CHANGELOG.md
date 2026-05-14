# Changelog

Sigue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) y [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Agregado
- Badges shields.io en el README — Platanus Build Night ft. Anthropic, Next.js 16, Claude Sonnet 4.5, Supabase, Tour 3D, Mapa Diáspora, Garantía 360°, Vitest, MIT, Hecho en Venezuela.
- **Modelo Garantía Llave 360°** — cero depósito al inquilino. Llave responde con sistema 5 capas (verificación previa con Trust Score, protocolo firmado, fondo Llave, gestión SUNAVI, supervisión semestral).
- **Mapa interactivo de la diáspora** en la landing — `react-simple-maps` con Natural Earth topojson, 10 ciudades animadas (Madrid, Bogotá, Buenos Aires, Miami, Lima, Santiago, Panamá, Houston, Quito, Ciudad de México), líneas dashed terracota desde Caracas con motion.
- **Inmueble icónico Loft Hackathon** — comedor de Fina capturado con Polycam (USDZ + .ply mesh) servido desde Supabase Storage. Aparece primero en `/buscar`. Copy con humor (Oreos, refresco, cables enredados).
- **Galería con video inline** — soporta `.mp4/.webm/.mov/.m4v`, grid dinámico hasta 6 thumbnails.
- **MeshViewer** (`three.js` PLYLoader) — render de PLY mesh de Polycam con orbit + bounds fit + barra de progreso.
- **Auth-aware header** — UserMenu con avatar, atajos, role switcher demo (cambia entre inquilino/asesor/propietario con la misma cuenta) y logout.
- **Login con contraseña + magic link** — tabs "Iniciar sesión" (signInWithPassword) y "Crear cuenta" (magic link + OTP código). `/login` redirige a tu dashboard si ya estás authed.
- **Onboarding con contraseña opcional** — el server action ahora hace `auth.updateUser({password})` además del profile upsert.
- **Markdown render en el chat** — `react-markdown` + GFM. Llavero ya no muestra `**asteriscos**` literales.
- **Boost del inmueble del hackathon en Llavero** — system prompt prioriza Loft Hackathon cuando preguntan "el mejor / icónico / del hackathon".
- **8va tool `setupMyProfile`** — onboarding conversacional via chat (alternativa al form).
- **Conversational onboarding** — banner "Habla con Llavero" en `/onboarding` precarga el chat para captura de rol + nombre + teléfono.
- **Smart App Banner Polycam** — `<meta apple-itunes-app id=1532482376>` en layout para que iOS muestre "Open" si la app está instalada.
- **LiDAR roadmap completo** — `docs/lidar-roadmap.md` con specs para App Clip + RoomPlan (sin depender de Polycam) y fallback photogrammetry vía Luma AI.
- **Comparativa anti-Quarto** — sección de la landing con tabla side-by-side y cost reveal ($840 fricción real vs $280 Llave).
- **Diáspora targeting** — sección dedicada con tour 3D destacado para los 7-8M venezolanos en el exterior.
- **Asesor responsable Rafael Oviedo** — DEMO_OWNER + fila de Supabase actualizada.
- **Trust Score progresivo en dashboard inquilino** — barra de gradiente, niveles (Élite / Premium / Confiable / En construcción / Inicial) y 3 cards de cómo subirlo.
- **CRM mockup en la landing** — `CrmMockup` component con sidebar, stats, mini chart animado, leads, redes conectadas, Meta Ads, burbuja Llavero.
- `AGENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE` en la raíz para discoverability — patrón inspirado en proyectos OSS maduros (referencia: graphify).

### Cambiado
- Paleta repintada a **terracota caribeño** (`#c4513a`) para diferenciarse de Quarto (verde) y de la categoría real-estate en general (azules).
- Tuteo venezolano consistente en TODA la UI y system prompt (cero voseo argentino).
- Hero usa el PNG real (`/brand/hero.png`) en lugar del R3F procedural.
- Tour 3D ahora aparece **antes** de la galería de fotos en `/inmueble/[id]`.
- `.card` CSS bajado a 0 especificidad con `:where()` para que utilidades Tailwind ganen.

### Arreglado
- Trigger `handle_new_user` en Postgres ahora swallow-errors — "Database error saving new user" ya no bloquea signup.
- verifyOtp prueba tipos `email` y `magiclink` automáticamente — resistente a token-type mismatch.
- Espaciado en el callout "Ahorras $560 al mudarte respecto al modelo tradicional".
- Panel "Para el inquilino" en `/#garantia` ahora renderiza con fondo terracota oscuro (antes blanco invisible).

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
