# Platanus Build Night ft. Anthropic

## 2026 - Caracas, Venezuela

---

This is the code repository for raor00 at Platanus Build Night 26, in Caracas.

* Full name: Rafael Alejandro Oviedo Rojas
* Github username: raor00

Remember you should push the code before the deadline and make sure its deployed.

Good luck 🍌🚀

---

<p align="center">
  <img src="./public/brand/banner.png" alt="Llave — Alquilar en 24 horas, sin papeles que no tienes" width="100%" />
</p>

# Llave — Alquila en 24 horas. Sin papeles que no tienes.

<p align="left">
  <img alt="Platanus Build Night" src="https://img.shields.io/badge/Platanus%20Build%20Night-ft.%20Anthropic-c4513a?style=for-the-badge&labelColor=4a1e13&logo=anthropic&logoColor=white" />
  <img alt="Claude Sonnet 4.6" src="https://img.shields.io/badge/Powered%20by-Claude%20Sonnet%204.6-D97757?style=for-the-badge&logo=anthropic&logoColor=white" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <a href="./LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" /></a>
  <img alt="Hecho en Venezuela" src="https://img.shields.io/badge/Hecho%20en-Venezuela%20%F0%9F%87%BB%F0%9F%87%AA-FCE300?style=for-the-badge&labelColor=CE1126" />
</p>

Plataforma venezolana de alquileres con **Llavero**, un agente IA construido sobre Claude Sonnet 4.6 que acepta a quien el modelo tradicional excluye: trabajadores informales, freelancers, estudiantes y la diáspora venezolana.

🌐 **Demo en vivo**: <https://llave-ruby.vercel.app>

---

## El problema

El alquiler tradicional venezolano (y la fintech "moderna" tipo Quarto) exige antes de mudarte:

- RIF, constancia de trabajo, movimientos bancarios de 3 meses
- 2 a 5 cosignatarios con ingresos 2.5× la renta
- 1 mes de adelanto + 1 mes de depósito + 1 mes de comisión + administrativo (>$800 antes de mudarte)
- 1 a 2 semanas de espera mientras los papeles dan vueltas

El 60% de la economía venezolana es informal. La diáspora paga alquiler a distancia para familiares. Los freelancers cobran en USDT/Zelle/Binance. Ninguno califica con el modelo viejo.

## Lo que Llave construyó

| Promesa | Implementación |
|---------|----------------|
| **Solo cédula** | Onboarding sin RIF, sin constancia, sin movimientos bancarios. Trust Score reemplaza la "capacidad de pago". |
| **Cero depósito al inquilino** | Garantía Llave 360° de 5 capas (verificación previa, protocolo firmado, fondo Llave, gestión SUNAVI, supervisión periódica). El depósito legal del Art. 19 LRCAV lo absorbe Llave, no el inquilino. |
| **Sin comisión al inquilino** | Solo el propietario paga comisión (10% por defecto, configurable). La plataforma se sostiene por volumen. |
| **24 a 48 horas** | Del primer chat con Llavero hasta el contrato firmado en PDF. |
| **Trust Score progresivo** | Sube +15 puntos por pago a tiempo, +30 por cierre limpio de contrato. Exportable como credencial verificable hacia banca. |
| **Tour 3D antes de viajar** | Gaussian Splat para fluidez, mesh `.ply` para fidelidad, `<model-viewer>` para AR Quick Look iOS. La diáspora ve cada ambiente sin tomar el vuelo. |

## Features por rol

### Inquilino

- Búsqueda guiada por **Llavero** (chat con voz + 12 tools).
- Dashboard con **Trust Score** y nivel (Inicial / En construcción / Confiable / Premium / Élite).
- **Contrato activo** con meses restantes, próximo pago, % de progreso y CTA de renovación cuando faltan ≤3 meses.
- **Pagos**: registra mensualidad por Transferencia / Pago Móvil / Zelle / Efectivo / Binance. Historial 6 meses y saldo en tiempo real.
- **Documentos**: contrato, cédula, comprobantes y otros archivos versionados.
- **Sugerencias predichas**: Llavero aprende del tráfico de búsqueda y propone inmuebles afines.
- **Notificaciones por rol** con recordatorio de pago, score updates y zonas con coincidencia.

### Asesor (CRM completo)

12 secciones agrupadas en sidebar colapsable:

**Operación**
- Dashboard con métricas reales (vistas, únicos, clicks, CTA, conversión, engagement compuesto 0–100)
- Leads en pipeline (nuevo / contactado / agendado / firmado)
- Contactos (12 seeded con source, tags, temperatura caliente/tibio/frío)
- Visitas con calendario semanal + recordatorio WhatsApp

**Cartera**
- Inmuebles con métricas por listing
- Captación móvil con cámara + workflow LiDAR (App Clip + RoomPlan en roadmap)
- **Publicar con IA**: wizard que lee GPS EXIF de la foto, ofrece geolocation del navegador como fallback, pinea en mapa Maplibre, y delega título/descripción/precio a Llavero
- Contratos (filtros y progress bar de meses)

**Crecimiento**
- Reportes (resumen ejecutivo, descargables, top inmuebles, embudo)
- Comisiones (cobrado mes / ganado año / total histórico, gráfico 6 meses, breakdown por tipo y ciudad)
- Marketing & Ads (Instagram / Facebook / TikTok / WhatsApp / X + Meta Ads con sugerencias de Llavero)

**Cuenta**
- Configuración (perfil, slider de comisión 5–15%, switches de notificaciones e integraciones)

**Algoritmo Llave**: el motor recomienda al asesor acciones concretas (responder lead en <1h, ajustar precio en inmueble con engagement alto sin leads, boost de Meta Ads, agregar tour 3D, priority listing). Badges: Respondedor relámpago, Cerrador del mes, Platinum (+$5k YTD), Embajador 3D.

### Propietario

- Sidebar dedicado con Dashboard, Inmuebles, Inquilinos, Contratos, Pagos, Documentos, Reportes.
- Stats: vistas reales por inmueble (7 días), ocupación, ingreso vigente, potencial mensual.
- **Saldo por inquilino**: identifica quién pagó qué inmueble, cuál está al día y cuál atrasado.
- Recordatorio automático (WhatsApp) al inquilino con saldo pendiente.

### Llavero IA

Agente sobre Claude Sonnet 4.6 (Vercel AI SDK v6, AI Gateway o Anthropic directo) con **12 tools** Zod-tipadas:

| Tool | Para |
|------|------|
| `searchProperties` | Búsqueda principal con filtros |
| `getPropertyDetail` | Ficha completa de un inmueble |
| `recommendByProfile` | Recomendación por lifestyle + presupuesto |
| `compareProperties` | Tabla comparativa 2–4 inmuebles |
| `scheduleVisit` | Crea lead `agendado` con datos del inquilino |
| `createPropertyDraft` | Publica inmueble (rol asesor) |
| `suggestPrice` | Rango sugerido con comparables |
| `setupMyProfile` | Onboarding conversacional (rol + nombre + teléfono) |
| `generateRentalContract` | Genera contrato LRCAV con cláusulas Art. 19, 22, 91 |
| `listMyContracts` | Devuelve contratos visibles según rol |
| `recordPayment` | Registra mensualidad y devuelve nuevo saldo |
| `getOwnerBalance` | Saldo total + por inquilino para el propietario |

Modo voz nativo (Web Speech API). Onboarding completo desde el chat: en 60 segundos Llavero recoge rol, nombre y teléfono y llama a `setupMyProfile` sin formulario.

### Contratos LRCAV en PDF

Llavero genera contratos respetando la **Ley para la Regularización y Control de los Arrendamientos de Vivienda**:

- Duración mínima 12 meses (vivienda)
- Prórroga automática si no se denuncia 60 días antes
- Notificación previa 90 días para no prórroga
- Desalojo solo por vía judicial bajo causales del Art. 91
- Depósito máximo 4 meses Art. 19 (absorbido por Llave, no cobrado al inquilino)
- Reajustes regulados por SUNAVI

El contrato se renderiza en `/contrato/[id]` con cláusulas formales y exporta a PDF vía `/contrato/[id]/print` con `window.print()` (sin dependencia externa).

### Tour 3D

Cuatro viewers ruteados por extensión en `src/app/inmueble/[id]/page.tsx`:

- URL `poly.cam` → **PolycamEmbed** (iframe embed de scan Polycam)
- `.splat` → **SplatViewer** (gsplat, Gaussian Splat fluido)
- `.ply` → **MeshViewer** (three.js PLYLoader, walkthrough WASD + PointerLock)
- `.glb` / `.usdz` / `.gltf` → **Tour3D** (Google `<model-viewer>`, AR Quick Look iOS)

El inmueble icónico "Comedor Fina" usa un GLB real (escaneo LiDAR Polycam) servido desde Supabase Storage.

### Widget Llavero flotante

FAB bottom-right presente en toda la app (`src/components/llavero/`). Panel de chat compacto que reutiliza `/api/chat` + ToolResult. La conversación persiste al navegar (provider montado en el root layout). Se oculta automáticamente en `/chat` para no duplicar la UI.

### Pitch deck

`/presentacion` — deck full-screen de 9 slides con ~66 s en autoplay. Soporta navegación manual. `src/components/presentacion/pitch-deck.tsx`. Botón "Presentación" en el header público.

### Showcase reel

`/showcase` — reel auto-loop de 6 escenas (~25 s). `src/components/showcase/showcase-reel.tsx`. Botón "Ver Llave en 30s" en el hero de la landing.

### Mapa de la diáspora

10 ciudades con marcadores animados y líneas terracota desde Caracas: Madrid, Bogotá, Buenos Aires, Miami, Lima, Santiago, Panamá, Houston, Quito, CDMX. Stats por país visibles.

### Notificaciones

Bell server-rendered con feed personalizado por rol (lead nuevo, visita agendada, vista nueva en inmueble, score boost, recordatorio de contrato, sugerencias). Activable como push del navegador (Notification.requestPermission). Web Push real con service worker + VAPID está en el roadmap.

### Marketplace

- Búsqueda con filtros (ciudad, tipo, precio, ambientes, baños, amenities).
- Modo lista o mapa Maplibre + Carto Positron.
- Comparador hasta 4 inmuebles con drawer flotante.

## Stack

- **Next.js 16 App Router** + Turbopack + React 19 + TypeScript strict
- **Vercel AI SDK v6** + `@ai-sdk/anthropic` (Claude Sonnet 4.6) con 12 tools Zod
- **Supabase SSR** (Auth + Postgres + RLS + Storage) con seed in-memory fallback
- **Tailwind v4** (terracota caribeño `#c4513a`)
- **React Three Fiber + drei** + **gsplat** + **`<model-viewer>`** + **three.js PLYLoader** + **Maplibre**
- **react-simple-maps** + Natural Earth topojson
- **Motion** (Framer Motion v12) — animaciones scroll-driven
- **react-markdown + remark-gfm** — render del chat
- **Web Speech API** — modo voz
- **Vitest + happy-dom** — 29 aserciones

## Setup local

```bash
pnpm install
cp env.example .env.local
# edita .env.local con tu ANTHROPIC_API_KEY (o AI_GATEWAY_API_KEY)
pnpm dev
```

Sin Supabase, la app corre con seed in-memory de 17 inmuebles, 5 contratos firmados, pagos y notificaciones. Sin key de IA, Llavero usa un parser local determinista que igual llama a las tools reales.

### Variables de entorno

| Variable | Requerida | De dónde sale |
|----------|-----------|---------------|
| `ANTHROPIC_API_KEY` | sí (preferida) | console.anthropic.com → API Keys |
| `AI_GATEWAY_API_KEY` | alterna | vercel.com → AI Gateway |
| `LLAVE_OFFLINE` | opcional | `1` fuerza el mock determinista |
| `NEXT_PUBLIC_SUPABASE_URL` | opcional | vercel.com → Marketplace → Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | opcional | mismo lugar |
| `SUPABASE_SERVICE_ROLE_KEY` | opcional | mismo lugar (server-only) |

`.env*` está gitignored. Ninguna clave real vive en el repo; `env.example` solo contiene placeholders. Detalle en [docs/security.md](./docs/security.md).

## Scripts

```bash
pnpm dev          # dev server (Turbopack)
pnpm test         # Vitest
pnpm test:watch
pnpm typecheck    # tsc --noEmit
pnpm build        # build de producción
pnpm lint         # ESLint
```

## Deploy

```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel deploy --prod
```

Producción en <https://llave-ruby.vercel.app>. Mirror público en <https://github.com/raor00/llave>.

## Estructura

```
src/
  app/
    page.tsx                    → Landing (motion + comparativa anti-Quarto + Garantía 360°)
    buscar/                     → Marketplace con lista/mapa + comparador
    inmueble/[id]/              → Detalle con tour 3D polimórfico (poly.cam / .splat / .ply / .glb)
    contrato/[id]/              → Contrato LRCAV firmable + ruta print (PDF via window.print)
    reporte/[type]/             → Reporte online + ruta print (9 tipos)
    chat/                       → Llavero IA con voz + tools inline
    onboarding/                 → Onboarding por rol (form o vía chat)
    presentacion/               → Pitch deck 9 slides con autoplay
    showcase/                   → Showcase reel 6 escenas ~25 s
    inquilino/                  → Trust Score, contrato, pagos, documentos, mensajes
    asesor/                     → CRM completo (12 secciones)
      inmuebles/[id]/editar/    → Formulario de edición de inmueble
      marketing/                → Feed social + crear publicaciones
      mensajes/                 → Bandeja de mensajes (asesor)
    propietario/                → Dashboard + saldos + contratos + documentos + mensajes
    login/                      → Magic link + OTP + contraseña
    update-password/            → Reset de contraseña post-magic-link
    api/chat/route.ts           → AI SDK streamText + 12 tools
    _actions/                   → Server actions (messages, properties, social)
  components/
    landing/                    → motion + comparativa + diáspora + garantía
    chat/                       → composer dvh + voz + markdown + tool-result
    marketplace/                → cards + filtros + mapa + tour-3d + splat-viewer + mesh-viewer
    asesor/                     → sidebar colapsable + captación + publicar-wizard +
                                   create-post-form + comment-thread
    propietario/                → sidebar dedicado
    llavero/                    → llavero-widget-provider + llavero-widget (FAB flotante)
    mensajes/                   → messages-inbox (bandeja 2 paneles + composer)
    inmuebles/                  → property-row-actions + edit-property-form
    contrato/                   → contract-document + auto-print + print-button
    reports/                    → report-document + period-picker
    presentacion/               → pitch-deck
    showcase/                   → showcase-reel
    notifications/              → notification-bell (server) + notification-bell-shell (client)
    celebration-overlay.tsx     → confetti al marcar un inmueble como alquilado
    dashboard-icons.tsx         → ~24 iconos SVG brand
    social-icons.tsx            → Instagram / Facebook / TikTok / WhatsApp / X / Meta
    ui/number-stepper.tsx       → stepper numérico accesible
  lib/
    ai/system-prompt.ts         → Personalidad Llavero (tuteo venezolano)
    ai/tools.ts                 → 12 tools Zod
    ai/lrcav.ts                 → 14 cláusulas LRCAV + buildContractDraft
    ai/local-mock-model.ts      → Fallback offline determinista
    db/queries.ts               → Supabase + seed fallback (+ updatePropertyStatus, updateProperty)
    db/seed-data.ts             → 17 inmuebles + DEMO_OWNER
    db/views.ts                 → Property views + 7-day timeseries
    db/contracts.ts             → Contracts store + APIs por rol
    db/contracts-list.ts        → Seed de 8 contratos para CRM
    db/payments.ts              → Payments store + saldo por contrato/propietario
    db/documents.ts             → Documents store
    db/visits.ts                → Visitas seed
    db/contacts.ts              → Contactos seed (CRM)
    db/marketing.ts             → Campañas + posts
    db/social-feed.ts           → POSTS_STORE + COMMENTS_STORE + toggleCommentLike
    db/messages.ts              → CONVERSATIONS_STORE + MESSAGES_STORE (seed in-memory)
    db/asesor-analytics.ts      → Motor de métricas + comisiones + oportunidades + badges
    notifications/              → seed (feed por rol) + queries (Supabase-aware)
    reports/report-builder.ts   → 9 tipos de reporte
    reports/period.ts           → selector de período (presets + rango custom)
    greeting.ts                 → Saludo dinámico America/Caracas tz
    exif.ts                     → JPEG EXIF GPS parser + reverse geocode
supabase/migrations/
  0001_init.sql                 → Schema base + RLS
  0002_seed.sql                 → 17 inmuebles + DEMO_OWNER
  0003_stats_contracts_notifications.sql
                                → property_views + contracts + notifications + RPC
docs/                           → Documentación detallada
tests/                          → Vitest (29 aserciones)
.claude/skills/llave/SKILL.md   → Skill del proyecto (auto-load)
```

## Documentación detallada

Todo lo extenso vive en [`docs/`](./docs/README.md):

- [Arquitectura](./docs/architecture.md) · [Rutas](./docs/routes.md) · [Modelo de datos](./docs/data-model.md)
- [Agente Llavero](./docs/agent-llavero.md) · [Branding](./docs/branding.md) · [Anatomía del logo](./docs/logo-anatomy.md)
- [Workflow de captura 3D](./docs/3d-capture-workflow.md) · [LiDAR roadmap](./docs/lidar-roadmap.md)
- [Desarrollo](./docs/development.md) · [Testing](./docs/testing.md) · [Deployment](./docs/deployment.md)
- [Seguridad](./docs/security.md) · [Roadmap](./docs/roadmap.md)
- [Handoff para retomar](./docs/handoff-prompt.md)

Contributors (humanos o agentes): `.claude/skills/llave/SKILL.md` se carga automáticamente con el contrato completo del proyecto. [`AGENTS.md`](./AGENTS.md) es la entrada agnóstica para Claude Code, Codex, Cursor, Gemini CLI, OpenCode.

## Roadmap

- Captura LiDAR nativa via App Clip de Llave + Apple RoomPlan (10 MB, sin install, abre con NFC/QR pegado al inmueble)
- Web Push real (service worker + VAPID + subscription)
- Trust Score exportable a banca como credencial verificable
- Pagos integrados (Pago Móvil API, USDT on-chain, Zelle conciliación)
- Identidad verificada para diáspora con OCR de cédula + liveness
- Integración Meta Ads en vivo con publicación bidireccional

Más en [docs/roadmap.md](./docs/roadmap.md).

## Seguridad

- `.env*` gitignored. Sin claves reales en repo ni en historial.
- `env.example` solo contiene placeholders (`sk-ant-xxxx…`, `YOUR_SERVICE_ROLE_KEY`).
- Service role JWT solo en server actions y API routes; nunca expuesto al cliente.
- RLS activo en `profiles`, `properties`, `leads`, `messages`, `favorites`, `contracts`, `notifications`, `property_views`.
- Inserts de visitas anónimas permitidas por policy abierta de `property_views.INSERT`, pero el SELECT solo el dueño del inmueble lo ve.

## Licencia

MIT — ver [LICENSE](./LICENSE). Hecho en Venezuela durante el Platanus Build Night ft. Anthropic, mayo 2026.
