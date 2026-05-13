# Deployment

## Producción actual

- URL: https://llave-ruby.vercel.app
- Project: `raor00s-projects/llave`
- Framework auto-detectado: Next.js 16
- Runtime: Node.js (Fluid Compute), `maxDuration: 60` en `/api/chat`
- Último deploy: `dpl_…` (correr `vercel ls` para el id vivo)

## Deploy inicial

```bash
vercel link --yes --project llave   # crea el project en Vercel + carpeta .vercel/
vercel env add ANTHROPIC_API_KEY production
vercel deploy --prod
```

## Variables de entorno

Las agregás a Vercel con `vercel env add <NOMBRE> <environment>`:

| Variable | Env | Requerida | Propósito |
|----------|-----|-----------|-----------|
| `ANTHROPIC_API_KEY` | production | preferida | Provider directo de Anthropic (sin prompt de tarjeta) |
| `AI_GATEWAY_API_KEY` | production | alterna | Routing por AI Gateway (requiere tarjeta en el team de Vercel) |
| `LLAVE_OFFLINE` | preview/dev | opcional | `1` fuerza el mock determinista — útil para previews sin gastar tokens |
| `NEXT_PUBLIC_SUPABASE_URL` | todas | opcional | Cambia la DB a Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | todas | opcional | Pareja del anterior |
| `SUPABASE_SERVICE_ROLE_KEY` | production | opcional | Operaciones admin server-only — NUNCA exponer al cliente |

`env.example` lista el mismo set con placeholders.

## Deploy / redeploy manual

```bash
vercel deploy --prod --yes
```

El flag `--yes` salta el prompt interactivo de scope; NO bypasea checks de seguridad. Cada deploy de prod es inmutable y se le asigna un `*.vercel.app` único más el alias de producción `llave-ruby.vercel.app`.

## Promover un preview a prod

```bash
vercel promote <preview-url>
```

## Rollback

```bash
vercel ls                         # encontrar el deploy bueno anterior
vercel rollback <deployment-url>  # apuntar el alias de prod ahí
```

## Dominio custom

Cuando esté listo:

```bash
vercel domains add llave.app
# o
vercel domains add llave.ve
vercel alias <deployment-url> llave.app
```

Los registros DNS aparecen en el dashboard de Vercel.

## Setup de Supabase (opcional, cuando dejes el seed in-memory)

1. Desde el dashboard de Vercel: Marketplace → Supabase. Las env vars aterrizan automáticamente en el project.
2. En el SQL editor de Supabase, correr `supabase/migrations/0001_init.sql` y después `0002_seed.sql`.
3. `vercel deploy --prod` para que las nuevas envs estén disponibles.

## Smoke después de cada deploy a prod

```bash
for p in / /buscar /chat /asesor /asesor/leads /login /icon /opengraph-image; do
  printf "%-22s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://llave-ruby.vercel.app$p)"
done
```

Y una prueba de tool-call:

```bash
curl -s -X POST https://llave-ruby.vercel.app/api/chat \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"id":"u1","role":"user","parts":[{"type":"text","text":"Busco apto en Caracas hasta $300"}]}]}' \
  | head -20
```

Deberías ver al menos un `tool-input-available` seguido por un `tool-output-available` con inmuebles desde el seed.
