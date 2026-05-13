# AGENTS.md — instrucciones para asistentes de IA

Este archivo lo leen herramientas como **Claude Code**, **Codex**, **Cursor**, **Gemini CLI**, **OpenCode** y similares antes de empezar a trabajar en el repo.

## Qué es Llave

Plataforma venezolana de alquileres con `Llavero`, un agente IA construido sobre Claude. Promesa única: **"Alquilá hoy. Sin meses adelantados."** Cuatro pilares: velocidad, 0 meses adelantados, 1 mes de depósito reembolsable, asistente IA.

## Reglas duras

1. **Leé `.claude/skills/llave/SKILL.md` antes de modificar nada.** Es el contrato vivo del proyecto: stack contract, folder map, registry de tools, convenciones. Está pensado para ser auto-cargado por Claude Code, pero cualquier agente debería leerlo manualmente.
2. **Toda la documentación está en español.** Si vas a escribir docs nuevos, mantené el tono rioplatense/venezolano cálido.
3. **No introduzcas color verde ni azul corporativo.** La marca es terracota `#c4513a`. Ver `docs/branding.md` y `docs/logo-anatomy.md`.
4. **Conventional Commits** sin `Co-Authored-By`. Un commit por work unit (deps, schema, UI, tools, polish).
5. **No exponer secretos.** `.env*` está gitignored. Solo placeholders en `env.example`. Si necesitás una env nueva, agregala via `vercel env add`.
6. **Type-check antes de commitear**: `node_modules/.bin/tsc --noEmit --skipLibCheck` debe pasar.
7. **Tests**: `pnpm test` corre Vitest. Si tocás `src/lib/ai/*` o `src/lib/db/*`, agregá o ajustá tests en `tests/`.
8. **Guardá observaciones en engram** (si tu agente lo soporta) con `project: inmuebles` y `topic_key` bajo `project/...`.

## Cómo encontrar las cosas

| Buscás… | Andá a… |
|---------|---------|
| Cómo está armado el sistema | `docs/architecture.md` |
| Rutas y qué renderiza cada una | `docs/routes.md` |
| El agente Llavero (system prompt, tools) | `docs/agent-llavero.md` + `src/lib/ai/` |
| Schema de la DB y RLS | `docs/data-model.md` + `supabase/migrations/` |
| Paleta, logo, prompts gpt-image-2 | `docs/branding.md` |
| Anatomía visual del logo | `docs/logo-anatomy.md` |
| Psicología de marca aplicada | `docs/brand-strategy.md` |
| Cómo probar la app | `docs/testing-flow.md` |
| Setup local y convenciones | `docs/development.md` |
| Deploy y env vars | `docs/deployment.md` |
| RLS, secretos, rotación | `docs/security.md` |
| Workflow de captura 3D | `docs/3d-capture-workflow.md` |
| Lo que viene | `docs/roadmap.md` |
| Retomar el proyecto en otra sesión | `docs/handoff-prompt.md` |

## Stack rápido

- Next.js 16 App Router + Turbopack
- React 19 + TypeScript strict
- Vercel AI SDK v6 + `@ai-sdk/anthropic` (Claude Sonnet 4.5)
- Supabase SSR + in-memory seed fallback
- Tailwind v4 con tokens terracota
- React Three Fiber (landing 3D) + Maplibre (mapa) + gsplat (Gaussian Splat viewer)
- Web Speech API (modo voz)
- Vitest + happy-dom (tests)
- Deploy: Vercel, auto-deploy desde `main` en GitHub

## Lo que NO hay que hacer

- No clones features de Quarto.app (la competencia). El diferenciador es el modelo de pago + el agente IA.
- No agregues estado global (Zustand/Redux). Server components + state local alcanzan.
- No agregues librerías de animación pesadas. Tailwind transitions bastan.
- No metas tests de UI a menos que la lógica sea no-trivial.
- No persistas chat-transcripts hasta que esté el plan en `docs/sdd/`.

## Quickstart

```bash
pnpm install
cp env.example .env.local      # editá con tu ANTHROPIC_API_KEY
pnpm dev                       # http://localhost:3000
pnpm test                      # 29 aserciones, 3 suites
pnpm typecheck                 # tsc --noEmit
```

Deploy en producción: `https://llave-ruby.vercel.app` (auto-deploy desde `main`).
