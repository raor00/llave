# Llavero — El agente de IA

`Llavero` es el agente conversacional de Llave. En producción corre sobre Anthropic Claude Sonnet 4.5; offline o sin key cae a un mock determinista local.

## Personalidad

Español venezolano, cálido y directo, sin slang. Anti-fricción por default: nunca pide meses adelantados, fiadores múltiples ni otras barreras abusivas. Siempre explica el *por qué* detrás de una recomendación.

El system prompt completo vive en `src/lib/ai/system-prompt.ts`. Declara:

- El manifiesto del producto (sin meses adelantados, comisión justa, garantía al propietario, reputación que vale).
- Reglas duras: nunca inventar inmuebles, siempre usar tools para datos reales, no volcar todos los detalles del inmueble en texto (la UI los muestra desde el output de la tool).
- Personalidad, idioma, y cómo tratar casos de empatía (poco presupuesto, primera vez alquilando, recién mudado).
- Bordes del roadmap (no da asesoría legal específica, no procesa pagos, no comparte datos personales entre usuarios).

## Tools

Todas las tools están Zod-tipadas (`src/lib/ai/tools.ts`) y ejecutan contra `src/lib/db/queries.ts`, que transparentemente elige Supabase o seed in-memory.

| Tool | Audiencia | Inputs | Side effects | Render en UI |
|------|-----------|--------|--------------|--------------|
| `searchProperties` | inquilino | `query?`, `city?`, `state?`, `type?`, `price_min?`, `price_max?`, `rooms_min?`, `bathrooms_min?`, `amenities?`, `limit?` | lectura | grid de `PropertyCard` |
| `getPropertyDetail` | inquilino | `property_id` | lectura | una card + CTA |
| `recommendByProfile` | inquilino | `budget_usd`, `city`, `lifestyle`, `needs?`, `rooms_min?` | lectura | lista rankeada con razones |
| `compareProperties` | inquilino | `property_ids[]` (2-4) | lectura | grid comparativo con chips "más barato"/"más amplio" |
| `scheduleVisit` | inquilino | `property_id`, `inquilino_name`, `inquilino_phone?` o `inquilino_email?`, `preferred_visit_at?`, `notes?` | insert en `leads` | card de éxito con link al inmueble |
| `createPropertyDraft` | asesor | `raw_notes`, `type`, `city`, `state`, `address`, `price_usd`, `rooms`, `bathrooms`, `area_m2?`, `amenities?`, `cover_url?` | insert en `properties` | card de éxito con link al nuevo aviso |
| `suggestPrice` | asesor | `city`, `type`, `rooms?`, `area_m2?` | lectura | card de rango + lista de comparables |

`stopWhen: stepCountIs(8)` le da hasta 8 pasos de razonamiento/tool antes de responder. El mock offline usa `stepCountIs(2)` porque emite exactamente una tool call.

## Selección de modelo (`src/app/api/chat/route.ts`)

```text
hasAnthropic = ANTHROPIC_API_KEY ∈ env
hasGateway   = AI_GATEWAY_API_KEY ∈ env
useOffline   = LLAVE_OFFLINE=1 || (!hasAnthropic && !hasGateway)

model = useOffline ? makeLocalMockModel(messages)
       : hasAnthropic ? anthropic(LLAVE_MODEL_ID ?? "claude-sonnet-4-5")
       :                LLAVE_GATEWAY_MODEL_ID ?? "anthropic/claude-sonnet-4-5"
```

La ruta corta payloads de más de 256 KB, conversaciones de más de 60 mensajes, valida JSON y devuelve 4xx por inputs inválidos antes de llegar al provider.

## Mock offline (`src/lib/ai/local-mock-model.ts`)

Parser determinista de intents que:

1. Extrae entidades del último mensaje del usuario (`city`, `type`, `rooms_min`, `price_max`, `amenities`, `property_id`).
2. Elige una tool por intent (`compareProperties`, `scheduleVisit`, `suggestPrice`, `createPropertyDraft`, `getPropertyDetail`, `recommendByProfile`, default `searchProperties`).
3. Empaqueta la elección en un `MockLanguageModelV3` que emite un intro corto + una `tool-call` + `finish`. El `execute()` real de la tool corre y devuelve datos del seed.

Cubierto por `tests/local-mock-model.test.ts` (16 aserciones entre extracción + ruteo de intent).

## Render en la UI (`src/components/chat/tool-result.tsx`)

Cada nombre de tool tiene su rama. La UI NO confía en el assistant para formatear inmuebles — lee el JSON `output` de la tool y dibuja el componente correcto. Por eso el system prompt le pide al modelo que sea breve y deje que la UI muestre las cards.

## Modo voz (`src/components/chat/use-voice.ts`)

Web Speech API solamente — sin dependencias externas. Feature-detected (`window.SpeechRecognition || window.webkitSpeechRecognition`). Idioma por default `es-VE`. El toggle "🔊 Voz" lee las respuestas del assistant con `speechSynthesis`.
