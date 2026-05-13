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

Una sola tinta — terracota profundo `#8a3722`. Sin amarillo, sin sol, sin acentos secundarios. Más coherente, más fuerte, lee a 16x16 px.

Implementación: `src/components/llave-logo.tsx` (`LlaveLogo` + el coloreable `LlaveLogoMark`). Reusado dentro del favicon dinámico (`src/app/icon.tsx`) y la imagen OG (`src/app/opengraph-image.tsx`).

## Paleta — Terracota caribeño

Color primario: **`#c4513a`** — terracota cálida. Cero competencia: ningún portal de real estate latinoamericano lo usa. Distinto a Quarto (turquesa), a Zillow (azul), a Encuentra24 (azul). Pareja perfecta con la crema `#faf8f3` (cemento + barro = arquitectura colonial caribeña).

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-brand-900` | `#4a1e13` | Fondos terracota profundo (footer) |
| `--color-brand-700` | `#8a3722` | Marcas del logo, headlines de énfasis |
| `--color-brand-600` | `#a04022` | Botones primarios hover |
| `--color-brand-500` | `#c4513a` | Botones primarios, links, primario por defecto |
| `--color-brand-300` | `#e0856e` | Bordes de card en hover, acentos cálidos |
| `--color-brand-100` | `#f7d9cb` | Blobs de fondo, chip de "Sin meses adelantados" |
| `--color-brand-50`  | `#fbeee5` | Fondos suaves de chip / sección |
| `--color-accent`    | `#e0856e` | Highlight, idéntico a brand-300 (un solo color) |
| `--color-danger`    | `#8a1d28` | Estados de error (rojo profundo distinto del brand) |
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
Minimal flat vector logo mark for "Llave", a rental marketplace. The mark is a stylized monogram "L" that reads as a key whose teeth ARE tiny houses. Composition: TOP — an elegant oval bow shaped like a soft orchid petal, tilted -10°, drawn as a hollow ring (no inner dot, no fill, no sun, completely empty inside). CENTER — a single clean vertical stroke descending from the bow (the key shaft / vertical of the letter L). BOTTOM — a horizontal stroke (the key spine) extending right from the base of the shaft, and SITTING ON TOP of that horizontal spine, three little pitched-roof house silhouettes step down in size from left to right (tallest closest to the shaft, smallest at the far right). Each house is a simple outline: two diagonal roof lines meeting at a peak, and two short verticals dropping to the spine — like a child's drawing of a house, but precise. NO doors, NO windows, NO chimney, NO sun, NO secondary color. Single ink: deep terracotta #8a3722, on a transparent background. Crisp 5–6 px strokes, rounded line caps, generous margin, centered. Feels warm, urban, Latin, premium. Style reference: Linear / Stripe minimal marks. Absolutely no gradients, shadows, watermarks, glows, or accent dots.
```

### Favicon (1024x1024, fondo terracota redondeado)

```
App icon 1024x1024 with rounded-square background in solid deep terracotta #8a3722 (corner radius 220px). Centered icon: the Llave monogram-key, drawn entirely in cream #faf8f3. Composition: hollow oval bow at the top (orchid-petal silhouette, tilted -10°, no inner dot, no sun, empty inside); vertical shaft descending; horizontal spine at the bottom; on top of the spine, three little pitched-roof house outlines stepping down in size from left to right. Strokes 12% of canvas width, rounded caps, no gradient, no shadow, no extra color. Reads clearly at 16x16 px.
```

### Banner Open Graph (1200x630)

```
Wide marketing banner 1200x630 for "Llave — Alquilar sin meses adelantados". Background: warm cream #faf8f3 with one soft organic blurred terracota blob #f7d9cb in the top-left corner only (no warm/gold blob anywhere). Top-left header: rounded square terracota #8a3722 badge containing the Llave monogram-key mark in cream — hollow oval orchid bow (no inner dot, no sun), vertical shaft, horizontal spine at the base with three pitched-roof tiny houses sitting on the spine, stepping down in size from left to right. Beside the badge, the wordmark "Llave" in deep terracotta #8a3722, Plus Jakarta Sans Bold 800, letter-spacing -1px. Main headline two lines: "Alquilar sin" in near-black, "meses adelantados." in a horizontal gradient from #8a3722 to #c4513a (terracota only, NO gold). Bold, 92px, letter-spacing -2px. Below: three rounded-pill chips "0 meses adelantados", "1 mes depósito", "100% reembolsable" — terracota text on pale green #fbeee5. Bottom row: "Con Llavero IA · construido en Venezuela" left, "llave.app" right in terracota bold. No watermarks, no gold accent anywhere, no sun.
```

### María — Avatar de asesora (512x512)

```
Friendly Latin American woman in her early 30s, warm natural smile, shoulder-length wavy dark brown hair, light olive skin, gentle eyes, wearing a simple terracota-green #c4513a blazer over a cream blouse, soft natural golden-hour lighting from the left, neutral warm cream background #faf8f3 with a very subtle soft green organic blob behind, flat illustration with subtle shading (not photorealistic), trustworthy professional real-estate-advisor energy, no text, no watermark, centered face, 512x512.
```

### Ilustración hero alternativa (1600x1200)

```
Cinematic 3/4 isometric illustration of a stylized cozy colonial-modern apartment building in warm cream and terracotta with deep terracotta door, balconies with tropical plants and colonial archway windows. To the right of the building, a giant terracota key floating diagonally — the key's bow is a hollow oval orchid petal (no inner dot, no sun), the teeth are three little pitched-roof houses stepping down in size, sitting on a horizontal key spine. The houses match the architecture of the building below. Subtle distant mountain silhouette abstracted enough to read as "any warm city". Soft late-afternoon light, depth of field, only terracota-toned organic blobs in the bokeh (no warm yellow). No text, no watermark, no flag. Style between Pixar UI and Apple "It Just Works" illustration.
```

### Banner README / GitHub social preview (1280x640)

Las cuatro promesas se muestran a la vez. La PRIMERA chip es la nueva ventaja de velocidad ("Alquilá hoy"), pintada en terracota deep con un rayo, para destacar visualmente sobre las otras tres en crema.

```
Wide hero banner 1280x640 for "Llave", a Venezuelan rental marketplace. Background: warm cream #faf8f3 with two soft organic blurred blobs — light terracotta #f7d9cb in the top-left, pale terracotta #fbeee5 in the bottom-right. LEFT COLUMN occupies ~55% of the width. Top-left: a 120x120 px rounded-square badge in deep terracotta #8a3722 (corner radius 28) with the Llave monogram-key in cream inside — hollow oval orchid-petal bow tilted -10° (no inner dot, no sun), vertical shaft, horizontal spine at the bottom, three pitched-roof tiny houses stepping down in size sitting on the spine. Beside the badge: wordmark "Llave" in deep terracotta #8a3722, Plus Jakarta Sans Bold 800, 44 px, letter-spacing -1.5; just below it a tracked-out tiny eyebrow "ALQUILAR · VENEZUELA · IA" in muted gray #4a5b58 letter-spacing 2 font-size 16, font-weight 600. Below this header: a three-line headline. Line 1: "Alquilá hoy." in near-black #0b1f1c. Line 2: "Sin meses" in near-black. Line 3: "adelantados." in a horizontal gradient from #4a1e13 to #8a3722 to #c4513a. All three lines Plus Jakarta Sans Bold 900, 76 px, letter-spacing -2. Below the headline: FOUR rounded-pill chips in a single row. (1) Solid terracota #8a3722, cream text "Alquilá hoy", with a small ⚡ lightning bolt icon to the left. (2) Cream #fbeee5 background, terracota #8a3722 text, "0 meses adelantados". (3) Cream #fbeee5 background, terracota text, "1 mes depósito reembolsable". (4) Cream #fbeee5 background, terracota text with a ✦ four-point spark icon, "Llavero IA". RIGHT COLUMN: three offset stacked property cards (white rounded rectangles 280x180 with subtle drop shadow, slightly rotated -3°/+2°/+8°), each showing a colored thumbnail in terracotta tints and a small price like "$280/mes" and a city. On top of the stack, a dark chat bubble (almost black, #0b1f1c, 320x84, rounded 22 px) with a tiny circular Llave avatar (terracotta badge with the monogram) on the left, the label "LLAVERO IA" in muted cream, and two lines of cream text: "Encontré 3 inmuebles que encajan / con tu presupuesto. ¿Agendamos visita?". Footer line at the very bottom in muted gray #7c8a87 font-size 14, letter-spacing 0.5: "Construido en Venezuela · Powered by Claude · llave-ruby.vercel.app". No watermarks, no green, no blue, no yellow gold. Style: warm fintech-meets-Caribbean. Premium, minimal, alive.
```

### Foto interior de inmueble (1200x900)

```
Photorealistic interior of a sunlit Caracas apartment living room, modern minimal furniture in cream and warm wood, large window with view to the Avila mountain at golden hour, plants in pots, light hardwood floor, soft natural lighting, photography style, shallow depth of field, no people, no text, no logos. 1200x900.
```

## Cuándo usar qué

- El favicon dinámico y la imagen OG generadas con `next/og` son la fuente de verdad en runtime — no hace falta tener archivos estáticos.
- Usá los outputs de gpt-image-2 como assets de marketing (decks, social, vallas). Si querés versionarlos, mételos en `public/brand/`.
