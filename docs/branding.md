# Branding

## Voz

Español venezolano, cálido, anti-fricción. Le habla con franqueza a gente cansada de la burocracia de los alquileres. Voseo cuando suena natural; nunca cae en slang paródico.

## Nombre

**Llave** — corta, propia, universalmente legible, pero arraigada en la idea de abrir una puerta que en Venezuela está casi siempre cerrada por los costos iniciales.

## Logo

Un monograma **L** que es una **llave cuyos dientes son casas**:

- **Bow** (paletón): óvalo inclinado -10°, hueco — sugiere pétalo de orquídea sin caer en simbología explícita. Sin punto interno: el óvalo es solo el contorno.
- **Caña**: trazo vertical de la L, también la caña de la llave.
- **Espina**: trazo horizontal al pie (el cuerpo de la llave).
- **Dientes**: tres casitas con techo a dos aguas, decrecientes de izquierda a derecha, apoyadas sobre la espina. El dibujo se vuelve literal: "una llave que abre puertas, y las muescas son las casas".

Una sola tinta — esmeralda profundo `#0a563a`. Sin amarillo, sin sol, sin acentos secundarios. Más coherente, más fuerte, lee a 16x16 px.

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
Minimal flat vector logo mark for "Llave", a rental marketplace. The mark is a stylized monogram "L" that reads as a key whose teeth ARE tiny houses. Composition: TOP — an elegant oval bow shaped like a soft orchid petal, tilted -10°, drawn as a hollow ring (no inner dot, no fill, no sun, completely empty inside). CENTER — a single clean vertical stroke descending from the bow (the key shaft / vertical of the letter L). BOTTOM — a horizontal stroke (the key spine) extending right from the base of the shaft, and SITTING ON TOP of that horizontal spine, three little pitched-roof house silhouettes step down in size from left to right (tallest closest to the shaft, smallest at the far right). Each house is a simple outline: two diagonal roof lines meeting at a peak, and two short verticals dropping to the spine — like a child's drawing of a house, but precise. NO doors, NO windows, NO chimney, NO sun, NO secondary color. Single ink: deep emerald green #0a563a, on a transparent background. Crisp 5–6 px strokes, rounded line caps, generous margin, centered. Feels warm, urban, Latin, premium. Style reference: Linear / Stripe minimal marks. Absolutely no gradients, shadows, watermarks, glows, or accent dots.
```

### Favicon (1024x1024, fondo esmeralda redondeado)

```
App icon 1024x1024 with rounded-square background in solid deep emerald #0a563a (corner radius 220px). Centered icon: the Llave monogram-key, drawn entirely in cream #faf8f3. Composition: hollow oval bow at the top (orchid-petal silhouette, tilted -10°, no inner dot, no sun, empty inside); vertical shaft descending; horizontal spine at the bottom; on top of the spine, three little pitched-roof house outlines stepping down in size from left to right. Strokes 12% of canvas width, rounded caps, no gradient, no shadow, no extra color. Reads clearly at 16x16 px.
```

### Banner Open Graph (1200x630)

```
Wide marketing banner 1200x630 for "Llave — Alquilar sin meses adelantados". Background: warm cream #faf8f3 with one soft organic blurred emerald blob #c8ecd6 in the top-left corner only (no warm/gold blob anywhere). Top-left header: rounded square emerald #0a563a badge containing the Llave monogram-key mark in cream — hollow oval orchid bow (no inner dot, no sun), vertical shaft, horizontal spine at the base with three pitched-roof tiny houses sitting on the spine, stepping down in size from left to right. Beside the badge, the wordmark "Llave" in deep emerald #0a563a, Plus Jakarta Sans Bold 800, letter-spacing -1px. Main headline two lines: "Alquilar sin" in near-black, "meses adelantados." in a horizontal gradient from #0a563a to #128c5d (emerald only, NO gold). Bold, 92px, letter-spacing -2px. Below: three rounded-pill chips "0 meses adelantados", "1 mes depósito", "100% reembolsable" — emerald text on pale green #e8f7ef. Bottom row: "Con Llavero IA · construido en Venezuela" left, "llave.app" right in emerald bold. No watermarks, no gold accent anywhere, no sun.
```

### María — Avatar de asesora (512x512)

```
Friendly Latin American woman in her early 30s, warm natural smile, shoulder-length wavy dark brown hair, light olive skin, gentle eyes, wearing a simple emerald-green #128c5d blazer over a cream blouse, soft natural golden-hour lighting from the left, neutral warm cream background #faf8f3 with a very subtle soft green organic blob behind, flat illustration with subtle shading (not photorealistic), trustworthy professional real-estate-advisor energy, no text, no watermark, centered face, 512x512.
```

### Ilustración hero alternativa (1600x1200)

```
Cinematic 3/4 isometric illustration of a stylized cozy colonial-modern apartment building in warm cream and terracotta with deep emerald door, balconies with tropical plants and colonial archway windows. To the right of the building, a giant emerald key floating diagonally — the key's bow is a hollow oval orchid petal (no inner dot, no sun), the teeth are three little pitched-roof houses stepping down in size, sitting on a horizontal key spine. The houses match the architecture of the building below. Subtle distant mountain silhouette abstracted enough to read as "any warm city". Soft late-afternoon light, depth of field, only emerald-toned organic blobs in the bokeh (no warm yellow). No text, no watermark, no flag. Style between Pixar UI and Apple "It Just Works" illustration.
```

### Foto interior de inmueble (1200x900)

```
Photorealistic interior of a sunlit Caracas apartment living room, modern minimal furniture in cream and warm wood, large window with view to the Avila mountain at golden hour, plants in pots, light hardwood floor, soft natural lighting, photography style, shallow depth of field, no people, no text, no logos. 1200x900.
```

## Cuándo usar qué

- El favicon dinámico y la imagen OG generadas con `next/og` son la fuente de verdad en runtime — no hace falta tener archivos estáticos.
- Usá los outputs de gpt-image-2 como assets de marketing (decks, social, vallas). Si querés versionarlos, mételos en `public/brand/`.
