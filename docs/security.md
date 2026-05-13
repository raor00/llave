# Seguridad

## Secretos

- Todas las API keys viven en env vars del project de Vercel (encriptadas at rest, encriptadas en transit, disponibles solo en runtime).
- El repo no contiene secretos reales. `env.example` solo trae placeholders (`sk-ant-xxxx…`, `vck_xxxx…`).
- `.gitignore` cubre `.env`, `.env.local`, `.env*.local`, `.env.*` y `.vercel/`.
- `pnpm test`, `node_modules/.bin/tsc`, y el dev server nunca escriben secretos a disco.

## Política de rotación de claves

Rotá cualquier clave que se haya compartido fuera de Vercel — incluyendo en chat con un colaborador o un AI assistant. Pasos:

1. Generá una clave nueva (consola de Anthropic para `ANTHROPIC_API_KEY`, dashboard de Vercel para `AI_GATEWAY_API_KEY`).
2. `vercel env rm <NOMBRE> production` y después `vercel env add <NOMBRE> production` con el valor nuevo.
3. `vercel deploy --prod` para que la nueva env llegue al deploy corriendo.
4. Revocá la clave vieja en la consola del provider.

Las claves provistas durante el hackathon deberían rotarse antes de abrir este repo al público.

## Auditoría de RLS (Postgres)

`supabase/migrations/0001_init.sql` activa RLS en todas las tablas. Las políticas siguen el principio de menor privilegio:

- `profiles` — leíble por cualquiera, escribible solo por el dueño.
- `properties` — leíble cuando el status es `disponible`/`reservado` o cuando sos el dueño; insertable por asesores solo con `owner_id = auth.uid()`; updatable/deletable por el dueño; rol `admin` puede todo.
- `leads` — leíble por el inquilino relacionado, el dueño, asesor o admin; insertable por cualquiera (anónimo); updatable bajo la misma visibilidad.
- `messages` — visibilidad sigue al lead padre.
- `favorites` — solo propios.

Pendientes de roadmap:

- Rate-limit a `scheduleVisit` para evitar spam de leads desde callers `LLAVE_OFFLINE` o no autenticados (planeado: Upstash Ratelimit en la ruta).
- Endurecer `createPropertyDraft` para que la tool se niegue cuando la sesión de chat no tenga identidad de asesor.

## Hardening de la API

`POST /api/chat` (`src/app/api/chat/route.ts`) impone:

- JSON body obligatorio (`400` si malformado).
- `messages` debe ser un array no vacío (`400`).
- Máximo 60 mensajes por request (`400`).
- Máximo 256 KB de payload via header `content-length` (`413`).
- Cuando no hay key y no está `LLAVE_OFFLINE`, cae al mock determinista (en código viejo respondía `503`; la versión actual prefiere degradar).

## Historial de auditorías

| Fecha | Auditor | Resultado |
|-------|---------|-----------|
| 2026-05-13 | `cavecrew-reviewer` | 1 BLOCKER + 3 HIGH + 7 MEDIUM. El blocker y la política RLS muy permisiva del asesor se arreglaron en el commit `1d78609`. Los MEDIUM restantes están en [roadmap.md](./roadmap.md). |

## Bug bounty / disclosure responsable

Todavía no. Cuando el proyecto pase del hackathon, publicar un SECURITY.md con contacto, llave PGP y política de disclosure.
