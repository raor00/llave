# Handoff prompt — copiar/pegar para continuar Llave en otra sesión

Pegá este prompt entero en una nueva sesión de Claude Code (u otro agente) cuando quieras que retomen Llave desde donde estamos.

---

```
/goal Cerrar Llave para el demo del Platanus Hackathon (Anthropic, mayo 2026): integrar Supabase real para persistencia entre sesiones, terminar de probar captación con cámara web + tour 3D, validar el flow end-to-end en mobile real, generar y subir el banner del repo, y dejar la URL pública 100% lista para una presentación de 90 segundos.

── CONTEXT ──
· Project: Llave — marketplace venezolano de alquileres con agente IA "Llavero" que rompe la fricción del modelo tradicional. Sin meses adelantados, depósito reducido reembolsable, garantía al propietario. Construido en el Platanus Hackathon Build Night.
· Stack: Next.js 16 App Router + Turbopack · React 19 · TypeScript strict · Vercel AI SDK v6 con Anthropic Claude Sonnet 4.5 direct (provider @ai-sdk/anthropic) · Supabase SSR (Postgres, in-memory seed fallback de 17 inmuebles si faltan envs) · Tailwind v4 con tokens terracota · React Three Fiber + drei (hero 3D procedural) · Maplibre GL + Carto tiles (mapa) · @vercel/og dinámico (favicon + OG) · @vercel/analytics + @vercel/speed-insights · Web Speech API (modo voz) · <model-viewer> de Google (tour 3D para USDZ/GLB) · Vitest + happy-dom · 29 aserciones en 3 suites, todas verdes.
· Current state: Deploy de producción en https://llave-ruby.vercel.app con TODAS las rutas en 200, /api/chat con tool calls reales contra Claude (smoke conocido: "apto en Caracas hasta $300 con planta eléctrica" → searchProperties → Las Mercedes $280). 9+ commits limpios en `main` local. Toda la documentación en español en `docs/`. Skill del proyecto en `.claude/skills/llave/SKILL.md` se carga automáticamente. Paleta TERRACOTA `#c4513a` (NO verde, NO azul). Logo es monograma "L que es llave cuyos dientes son casas".
· Working dir: /Users/Jefemac/Documents/Inmuebles. Sin remoto en GitHub todavía (el usuario eligió "no pushear ahora" hasta cerrar el demo).
· Constraints:
   - Quedan horas finitas del hackathon. Anthropic event → valoran uso de Claude + AI SDK.
   - JAMÁS exponer keys en commits. Solo placeholders en env.example. `.gitignore` cubre `.env*`.
   - Sin tarjeta de crédito en Vercel → preferir ANTHROPIC_API_KEY direct, no AI Gateway.
   - Permisos del workspace BLOQUEAN escribir archivos `.env*`. Usar `vercel env add` y documentar fallbacks.
   - Mobile testing real es prioritario (voice mode + cámara solo se prueban en device).
   - Sin emojis en código ni commits. Conventional commits sin Co-Authored-By.
· Audience: Jueces del hackathon (técnicos de Anthropic/Vercel/Platanus), inquilinos venezolanos arquetipo "no tengo $1400 upfront pero sí puedo $250/mes", asesores que quieren un CRM con IA, propietarios que quieren garantía sobre su inmueble.

── SUCCESS CRITERIA (ALL MUST BE TRUE) ──
1. Supabase provisionado vía Vercel Marketplace en la cuenta del usuario; envs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY seteadas en production con `vercel env add`.
2. Migraciones `supabase/migrations/0001_init.sql` y `0002_seed.sql` aplicadas; tablas profiles, properties, leads, messages, favorites con RLS activa y 17 inmuebles seedeados.
3. `searchProperties` / `scheduleVisit` / `createPropertyDraft` ahora escriben y leen contra Supabase. Test crítico: publicar un inmueble vía /asesor/captacion → cerrar pestaña → reabrir → el inmueble sigue listado.
4. /asesor/captacion probado en iPhone real: cámara abre, foto se toma, preview funciona, submit publica el inmueble y aparece en /buscar.
5. Tour 3D (<model-viewer>) embebe correctamente un USDZ/GLB de prueba. Subir un .glb sample a public/brand/sample-tour.glb y vincularlo a un inmueble seed por su tour_3d_url.
6. Logo banner generado con gpt-image-2 usando el prompt de docs/branding.md sección "Banner README / GitHub social preview (1280x640)" y commiteado como public/brand/banner-1280x640.png.
7. README.md actualizado con el banner arriba de todo y referencias a docs/.
8. /api/chat en prod sigue contestando con tool calls reales. Smoke automático del docs/testing-flow.md pasa entero (8 rutas + 1 tool call probe).
9. `node_modules/.bin/tsc --noEmit --skipLibCheck`, `pnpm test`, `pnpm build` pasan limpios.
10. Vercel Analytics y Speed Insights recibiendo datos reales después de una visita.

── OPERATING RULES — NON-NEGOTIABLE ──
1. PLAN FIRST. Lista de tasks numerada con TaskCreate antes de tocar código.
2. WORK AUTONOMOUSLY. No preguntes salvo bloqueo real (env var faltante, secreto no entregado, decisión arquitectónica con tradeoffs).
3. SELF-VERIFY. Después de cada cambio: `node_modules/.bin/tsc --noEmit --skipLibCheck` + curl smoke + leer dev server logs.
4. DEBUG YOURSELF. Si /api/chat empieza a devolver 503 o errores de AI Gateway, primero verifica `vercel env ls`, después diagnostica `src/app/api/chat/route.ts`. No devuelvas el problema sin intentar.
5. USE EVERY TOOL. Engram para memoria persistente (`project: inmuebles`, topic_keys bajo `project/...`). cavecrew-reviewer para auditar antes de commitear cambios grandes. SDD-lite en `docs/sdd/000N-<slug>/` para cambios no-triviales. Vitest para regresión.
6. NO PLACEHOLDERS. Todas las features deben funcionar de verdad. Si no podés implementar algo, marcá en docs/roadmap.md y no lo dejes a medio.
7. PROGRESS LOG. Cada milestone → `mem_save` con topic_key `project/progress/<phase>` + conventional commit por work-unit (separar deps, migraciones, UI, tools, polish).
8. STAY ON GOAL. La meta es el demo de 90s con persistencia real. Todo lo demás → roadmap.
9. IF BLOCKED. Documentá el bloqueo en docs/sdd/000N-<slug>/ y seguí con lo paralelizable.
10. CHECK SUCCESS BEFORE STOPPING. Re-leé los 10 criterios y confirmá uno por uno con evidencia.

── QUALITY BAR ──
· Código: TypeScript strict, sin `any` (salvo escape hatch comentado), conventional commits, sin emojis, sin Co-Authored-By. `.claude/skills/llave/SKILL.md` es la guía operativa — leerla antes de cambiar convenciones.
· Diseño: paleta terracota `#4a1e13` → `#c4513a`. Logo monograma-llave-con-casas SOLO en terracota o cream. JAMÁS verde, azul corporativo, ni amarillo dorado.
· Output: tsc clean + Vitest 29+ verde + smoke prod (8 rutas 200) + /api/chat con tool call real verificado.
· Docs: cada feature nueva con sección en `docs/` y, si rompe convención, entrada nueva en `.claude/skills/llave/SKILL.md`.

── REFERENCIAS DEL REPO ──
· docs/README.md — índice de documentación
· docs/architecture.md — sistema y request lifecycles
· docs/routes.md — mapa de rutas
· docs/agent-llavero.md — system prompt + 7 tools (searchProperties, getPropertyDetail, recommendByProfile, compareProperties, scheduleVisit, createPropertyDraft, suggestPrice)
· docs/data-model.md — schema Postgres + RLS
· docs/branding.md — paleta + prompts gpt-image-2 (incluye prompt del banner)
· docs/logo-anatomy.md — significado de cada parte del logo
· docs/brand-strategy.md — psicología de marketing aplicada
· docs/testing-flow.md — smoke automático + flujo manual + guion de demo 90s
· docs/development.md — setup local y convenciones
· docs/deployment.md — Vercel + env vars + rollback
· docs/security.md — auditoría RLS + rotación de keys
· docs/roadmap.md — corto/mediano/largo plazo + no-goals
· .claude/skills/llave/SKILL.md — contrato vivo del proyecto
· src/lib/ai/system-prompt.ts — personalidad Llavero
· src/lib/ai/tools.ts — 7 tools Zod-tipadas
· src/lib/ai/local-mock-model.ts — fallback offline (intent parser + MockLanguageModelV3)
· src/lib/db/queries.ts — Supabase + seed fallback
· src/lib/db/seed-data.ts — 17 inmuebles seed
· supabase/migrations/0001_init.sql + 0002_seed.sql — schema + datos
· tests/ — Vitest suites

── FINAL DELIVERABLE ──
✅ Confirmación de cada uno de los 10 criterios con evidencia (curl, screenshot, URL).
📂 Lista exhaustiva de archivos tocados con su conventional commit asociado.
🚀 Comandos exactos para reproducir: `vercel deploy --prod`, aplicación de migraciones en Supabase, smoke prod, etc.
📊 Pruebas: outputs de `pnpm test`, `tsc`, curls de prod, y captura del Vercel Analytics dashboard.
📝 Decisiones tomadas + cualquier cosa que el siguiente que lea esto deba saber.
⚠️ Limitaciones conocidas y follow-ups (rate-limit scheduleVisit, role-gate createPropertyDraft, pagination dashboard, push a GitHub cuando el usuario lo autorice).

Begin by outputting your plan. Then execute end-to-end without checking in until done or genuinely blocked.
```
