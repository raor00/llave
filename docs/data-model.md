# Modelo de datos

El schema de Postgres vive en `supabase/migrations/0001_init.sql`. Los datos seed están en `supabase/migrations/0002_seed.sql` y replicados en `src/lib/db/seed-data.ts` para el fallback in-memory.

## Enums

```sql
user_role       = inquilino | asesor | propietario | admin
property_type   = apartamento | casa | local | edificio | habitacion
property_status = disponible | reservado | alquilado | pausado
lead_status     = nuevo | contactado | agendado | descartado | firmado
lead_source     = chat | directo | asesor
message_role    = user | assistant | tool | system
```

## Tablas

### `profiles`
- `id uuid PK` (coincide con `auth.users.id` para usuarios reales; no es FK estricta para poder seed sin auth)
- `role` (enum, default `inquilino`)
- `full_name`, `phone`, `avatar_url`, `bio`, `city`
- `rating_avg numeric(3,2)`, `rating_count int`
- `trust_score int` — placeholder para la futura "reputación que vale para banca"
- `created_at`, `updated_at`

Trigger `on_auth_user_created` (security definer) inserta automáticamente un profile cuando se crea una fila en `auth.users`, copiando `full_name` desde metadata.

### `properties`
- `id uuid PK`
- `owner_id` → `profiles.id`
- `title`, `description`
- `type` (property_type), `status` (property_status, default `disponible`)
- `address`, `city`, `state`, `country` (default `Venezuela`), `lat`, `lng`
- `price_usd numeric(10,2)`
- `no_months_upfront boolean default true` — compromiso visible Llave
- `deposit_months numeric(3,1) default 1`
- `rooms`, `bathrooms`, `area_m2`, `parking_spots`
- `amenities text[]`, `rules text[]`
- `cover_url`, `gallery_urls text[]`, `spline_scene_url`, `tour_3d_url`
- `search_tsv tsvector` — mantenido por el trigger `properties_tsv_update`
- `created_at`, `updated_at`

Índices: `status`, `city`, `type`, `price_usd`, GIN sobre `search_tsv`.

### `leads`
- `id uuid PK`
- `property_id` → `properties.id` (cascade)
- `inquilino_id` → `profiles.id` (set null) — null cuando el lead es anónimo
- `inquilino_name`, `inquilino_phone`, `inquilino_email`
- `status` (lead_status, default `nuevo`)
- `source` (lead_source, default `directo`)
- `preferred_visit_at`, `notes`, `agent_summary`

`agent_summary` es la prosa que escribe Llavero cuando crea un lead vía `scheduleVisit`.

### `messages`
Tabla opcional para historial de chat (persistir conversaciones por lead). Hoy `/api/chat` no escribe acá — eso es para un próximo SDD.

### `favorites`
PK compuesta `(user_id, property_id)`.

## Postura de RLS

Todas las tablas con RLS habilitada.

- `profiles` — `select`: público. `insert/update`: solo el dueño.
- `properties` — `select`: público para `disponible|reservado` o dueño. `insert`: asesores solo con `owner_id = auth.uid()`. `update/delete`: solo dueño o admin.
- `leads` — `select`: el inquilino dueño + el dueño/admin del inmueble. `insert`: cualquiera (leads anónimos permitidos hoy; planeado gatearlos). `update`: misma visibilidad.
- `messages` — visibilidad sigue al lead padre.
- `favorites` — solo propios.

Auditada y endurecida por el reviewer pre-commit (commit `1d78609`).

## Buckets de Storage (Supabase)

`properties` (público) para covers y galerías. `avatars` (público) para fotos de perfil. Se crean en `0001_init.sql`.

## Seed in-memory (offline / sin Supabase)

`src/lib/db/seed-data.ts` exporta:
- `DEMO_OWNER` — perfil de asesor único (UUID `1111…1111`).
- `DEMO_PROPERTIES` — 17 inmuebles en Caracas, Valencia, Maracaibo, Barquisimeto, Mérida, Lechería, El Hatillo, San Antonio de los Altos.
- `DEMO_LEADS` — 2 leads de ejemplo atados a los inmuebles seed.

`queries.ts` cambia al seed cuando `SUPABASE_ENABLED` es false (es decir, falta alguna env pública).

## Agregar un campo nuevo a `properties`

Tocá los cuatro lugares para mantener el dual-path coherente:

1. `supabase/migrations/000N_<cambio>.sql` — columna nueva + impacto en RLS.
2. `src/lib/types.ts::Property` — tipo TypeScript.
3. `src/lib/db/seed-data.ts` — valores de ejemplo.
4. `src/lib/ai/tools.ts` — si el campo es consultable/recomendable, exponelo en algún input de tool.
