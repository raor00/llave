# Security

Detalle completo en [`docs/security.md`](./docs/security.md).

## TL;DR

- **Secretos**: viven solo en env vars de Vercel. El repo nunca contiene claves reales — solo placeholders en `env.example`. `.gitignore` cubre `.env`, `.env.local`, `.env*.local`, `.env.*`, `.vercel/`.
- **Rotación**: cualquier clave que se haya compartido fuera de Vercel (chat con colaborador, IA, deck) se rota inmediatamente. Steps en `docs/security.md`.
- **RLS**: todas las tablas en Supabase tienen Row Level Security activa. Asesores solo pueden insertar/updatear sus propias propiedades. Inquilinos solo ven sus leads. `admin` puede todo.
- **API hardening**: `/api/chat` valida JSON, exige `messages` no vacío (max 60), corta payloads >256 KB, fallback al mock cuando faltan keys.

## Reportar una vulnerabilidad

Hasta el cierre del hackathon, escribir un issue público marcado `security`. Postlanzamiento abriremos un canal privado (PGP).

## Historial de auditorías

| Fecha | Auditor | Resultado | Commit fix |
|-------|---------|-----------|------------|
| 2026-05-13 | `cavecrew-reviewer` | 1 BLOCKER + 3 HIGH + 7 MEDIUM | `1d78609` (blocker + RLS asesor) |

Los MEDIUM diferidos están en [`docs/roadmap.md`](./docs/roadmap.md).
