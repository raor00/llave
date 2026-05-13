# Branding

## Voz

Español venezolano, cálido, anti-fricción. Le habla con franqueza a gente cansada de la burocracia de los alquileres. Voseo cuando suena natural; nunca cae en slang paródico.

## Nombre

**Llave** — corta, propia, universalmente legible, pero arraigada en la idea de abrir una puerta que en Venezuela está casi siempre cerrada por los costos iniciales.

## Logo

Un monograma **L** que se lee como **llave**:

- **Bow** (paletón): óvalo inclinado -10°, sugiere pétalo de orquídea (flor nacional venezolana) pero a nivel global lee como geometría elegante.
- **Acento central**: punto dorado cálido — el sol.
- **Caña**: trazo vertical de la L, que es también la caña de la llave.
- **Dientes**: tres arcos suaves al pie — arcadas coloniales caribeñas, NO muescas cuadradas.

Por qué esta composición: cero competencia con el cubo-y-cerradura de Quarto, calidez orgánica sin encerrarse en iconografía hiper-venezolana, legible a 16x16 px.

Implementación: `src/components/llave-logo.tsx` (`LlaveLogo` + el coloreable `LlaveLogoMark`). Reusado dentro del favicon dinámico (`src/app/icon.tsx`) y la imagen OG (`src/app/opengraph-image.tsx`).

## Paleta

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-brand-900` | `#082d20` | Fondos esmeralda profundo (footer) |
| `--color-brand-700` | `#0a563a` | Acentos de headline, stats del asesor |
| `--color-brand-500` | `#128c5d` | Botones primarios, hover de links |
| `--color-brand-300` | `#6ec79c` | Bordes de card en hover |
| `--color-brand-100` | `#c8ecd6` | Blobs de fondo, chips |
| `--color-brand-50`  | `#e8f7ef` | Fondo de chip |
| `--color-accent`    | `#f4c95d` | Sol dorado, chip de highlight |
| `--color-danger`    | `#c44141` | Estados de error |
| `--color-fg`        | `#0b1f1c` | Texto principal |
| `--color-fg-muted`  | `#4a5b58` | Texto secundario |
| `--color-fg-soft`   | `#7c8a87` | Captions |
| `--color-bg`        | `#faf8f3` | Fondo crema de página |
| `--color-bg-elev`   | `#ffffff` | Cards |
| `--color-border`    | `#e7e3d8` | Bordes suaves |

Definidos en `src/app/globals.css` bajo `@theme`. Siempre referenciá vía `var(--color-…)` — nunca pongas hex hard-coded dentro de componentes.

## Tipografía

| Familia | Uso | Variable |
|---------|-----|----------|
| Inter | Cuerpo | `--font-inter` |
| Plus Jakarta Sans | Display (títulos, wordmark) | `--font-jakarta` |

Cargadas con `next/font/google` desde `src/app/layout.tsx`.

## Prompts de generación de imagen (gpt-image-2)

Estos son los prompts canónicos. Pegalos tal cual; no improvises el tono.

### Logo mark (1024x1024, transparente)

```
Minimal vector logo mark for "Llave", a rental marketplace. The mark is a stylized monogram "L" that simultaneously reads as a key. Composition: at the top, an oval bow shaped like a soft orchid petal tilted -10° (representing Venezuelan orchid, the national flower, but read globally as elegant geometry); inside the bow, a small warm gold dot like a tropical sun. Below the bow, a single clean vertical stroke (key shaft, also the vertical of the letter L). The base extends right as three soft rounded arches, evoking colonial Caribbean balcony archways — NOT square key notches. Two-color palette: deep emerald green #0a563a for the linework, warm golden yellow #f4c95d for the inner sun accent. Flat vector, no gradient, no shadow, crisp 5px strokes, generous margin, centered on transparent background. Feels warm, Latin, premium, globally scalable. Style reference: Linear meets Carto meets Stripe.
```

### Favicon (1024x1024, fondo esmeralda redondeado)

```
App icon 1024x1024 with rounded-square background in solid Llave emerald #128c5d (corner radius 220px). Centered icon: same monogram described as a stylized "L" key — top oval orchid-petal bow tilted -10° (cream stroke #faf8f3), small warm gold dot #f4c95d inside the bow, vertical shaft, three soft rounded colonial-arch teeth extending right at the bottom. Strokes 12% of canvas width, no gradient, no shadow, crisp edges. Designed to read clearly at 16x16 px.
```

### Banner Open Graph (1200x630)

```
Wide marketing banner 1200x630 for "Llave — Alquilar sin meses adelantados". Background: warm cream #faf8f3 with two soft organic blurred blobs (one emerald #c8ecd6 top-left, one warm gold #f4c95d33 bottom-right). Top-left corner: rounded square emerald badge with the Llave monogram-key mark (oval orchid bow tilted -10°, gold sun dot, vertical shaft, three soft colonial-arch teeth). Beside it the wordmark "Llave" in deep emerald #0a563a, Plus Jakarta Sans Bold 800, letter-spacing -1px. Main headline two lines: "Alquilar sin" in near-black, "meses adelantados." in a horizontal gradient from #0a563a to #128c5d to #f4c95d. Bold, 92px, letter-spacing -2px. Below the headline: three rounded-pill chips reading "0 meses adelantados", "1 mes depósito", "100% reembolsable" — emerald text on pale green #e8f7ef pill. Bottom row: "Con Llavero IA · construido en Venezuela" left, "llave.app" right in emerald bold. No watermarks. Premium fintech-meets-warm-Caribbean aesthetic.
```

### María — Avatar de asesora (512x512)

```
Friendly Latin American woman in her early 30s, warm natural smile, shoulder-length wavy dark brown hair, light olive skin, gentle eyes, wearing a simple emerald-green #128c5d blazer over a cream blouse, soft natural golden-hour lighting from the left, neutral warm cream background #faf8f3 with a very subtle soft green organic blob behind, flat illustration with subtle shading (not photorealistic), trustworthy professional real-estate-advisor energy, no text, no watermark, centered face, 512x512.
```

### Ilustración hero alternativa (1600x1200)

```
Cinematic 3/4 isometric illustration of a stylized cozy colonial-modern apartment building in warm cream and terracotta with emerald-green door, balconies with tropical plants (palms, orchids in pots) and gentle colonial archway windows. To the right of the building, a giant glowing softly-golden key floating diagonally — the key's bow is an oval orchid petal, the teeth are three soft arches matching the architecture below. Subtle Avila-mountain-like silhouette far in the background but abstracted enough to read as "any warm city". Soft sunset light, depth of field, pastel emerald and gold organic gradient blobs in the bokeh. No text, no watermark, no flag. Style between Pixar UI and Apple "It Just Works" illustration.
```

### Foto interior de inmueble (1200x900)

```
Photorealistic interior of a sunlit Caracas apartment living room, modern minimal furniture in cream and warm wood, large window with view to the Avila mountain at golden hour, plants in pots, light hardwood floor, soft natural lighting, photography style, shallow depth of field, no people, no text, no logos. 1200x900.
```

## Cuándo usar qué

- El favicon dinámico y la imagen OG generadas con `next/og` son la fuente de verdad en runtime — no hace falta tener archivos estáticos.
- Usá los outputs de gpt-image-2 como assets de marketing (decks, social, vallas). Si querés versionarlos, mételos en `public/brand/`.
