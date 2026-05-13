# Roadmap

El MVP es chico a propósito. Estas son las features que dejamos para después. Ninguna bloquea la entrega del hackathon.

## Corto plazo (próximas 1-2 semanas)

- **Rate-limit en `scheduleVisit`** con Upstash Ratelimit (por IP + por sesión). Frena spam de leads desde callers anónimos.
- **Gating de rol de asesor** en `createPropertyDraft` — la tool se niega si la sesión no tiene identidad de asesor.
- **Paginación en `/asesor`** — solo relevante cuando un asesor pasa de ~100 publicaciones.
- **Persistir conversaciones** en `messages` para que los leads carguen el chat que los originó.
- **Llave Score** — un score del inquilino evaluado por Claude (historial, proxy de ingresos, referencias) visible en `/asesor/leads`.

## Mediano plazo

- **Tours 3D con LiDAR** — escaneo desde el iPhone, upload a Vercel Blob, render en `/inmueble/[id]` con `@react-three/fiber` y `@react-three/drei`.
- **Contratos generados** — Claude redacta el contrato, ambas partes firman in-app, el PDF firmado queda en Supabase storage.
- **Integración Meta Ads + redes sociales** — conectar Instagram/Facebook desde el panel del asesor, publicar y responder comentarios sin salir de Llave.
- **Búsquedas guardadas + alertas** — email o push cuando un nuevo inmueble matchea el perfil de un inquilino.
- **UI multi-idioma** — inglés primero, después portugués para Brasil.

## Largo plazo

- **Perfil crediticio del inquilino** útil para bancos — historial de pagos a tiempo exportable como credencial verificable.
- **Tokenización / propiedad fraccional** — no es prioridad pero queda explorado como diferenciador a largo plazo.
- **Expansión regional** — México, Colombia, Argentina. El branding evita símbolos hiper-locales a propósito para reskinear por país.

## No-goals explícitos

- No vamos a construir un portal genérico de inmuebles (Encuentra24 / Mercadolibre Inmuebles).
- No vamos a pivotear de alquileres a venta.
- No vamos a convertirnos en un SaaS de property management (Buildium / AppFolio).

Estas tres son las atracciones gravitatorias más fuertes para un proyecto así. Dejarlas escritas como no-goals nos mantiene honestos.
