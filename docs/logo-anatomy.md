# Anatomía del logo

El monograma de Llave es una **L que es una llave cuyos dientes son casas**. Cada trazo tiene una razón. Esta es la lectura oficial — la que repetimos en cualquier deck, on-boarding de asesores, o material institucional.

## Diagrama

```
       ⬭        ←  ① Bow (paletón)
       │
       │        ←  ② Caña (vertical de la L, caña de la llave)
       │
       ────────┐         ←  ③ Espina (cuerpo horizontal de la llave)
        ▲ ▲ ▲             ←  ④ Dientes-casa (techos a dos aguas decrecientes)
        ▯ ▯ ▯
```

## Las cuatro partes

### ① Bow (paletón) — el óvalo de arriba

**Forma**: óvalo hueco inclinado -10°.
**Lectura literal**: el paletón de una llave (la parte por donde la agarrás).
**Lectura simbólica**: pétalo de orquídea — flor nacional de Venezuela — sin caer en simbología explícita. A nivel global se lee como geometría suave y elegante.
**Por qué hueco (sin punto interior)**: una sola decodificación. El punto dorado original confundía a usuarios nuevos ("¿es un sol?"). Sacarlo bajó la fricción cognitiva.

### ② Caña — el trazo vertical

**Lectura literal doble**: es la caña de la llave **y** el palo vertical de la letra **L**.
**Función de marca**: ancla la primera letra de "Llave" sin que tengamos que recurrir a tipografía dentro del logo. El cerebro reconstruye la palabra automáticamente — *priming* tipográfico.

### ③ Espina — el trazo horizontal de la base

**Lectura literal**: el cuerpo de la llave donde se sostienen los dientes.
**Lectura geométrica**: cierra la **L** (el pie de la letra) sin necesidad de un segundo trazo separado. La L y la llave son la misma figura.

### ④ Dientes-casa — los tres techos a dos aguas

**Forma**: tres siluetas de casa con techo triangular, decrecientes de izquierda a derecha.
**Lectura literal**: los dientes (las muescas) de la llave.
**Lectura del producto**: el inventario de Llave — las casas que la llave abre.
**Por qué decrecientes**: sugiere perspectiva, profundidad, una pequeña ciudad. Si fueran del mismo tamaño se leerían como muescas técnicas; al variar, se leen como techos. **Decremento = arquitectura**.
**Por qué tres**: el cerebro procesa hasta tres elementos como un conjunto sin esfuerzo (regla mnemónica de los grupos de tres). Cuatro empieza a leerse como "muchos".

## Cómo se lee de un vistazo

La gente recorre el logo en este orden visual:

1. **Bow** (la primera curva, lo más prominente) → registra "llave".
2. **Caña** desciende → la mirada baja.
3. **Dientes-casa** → registra "casas".
4. **Cierre Gestalt** → el cerebro fusiona "llave + casas" en un solo concepto: **acceso a un hogar**.

Tres ideas, un solo trazo, una sola tinta terracota. Esa es la huella que queremos que quede.

## Reglas operativas

- **Espacio de protección**: alrededor del logo, dejar como mínimo el ancho del bow (1× el óvalo de arriba).
- **Tamaño mínimo**: 16x16 px (favicon). Por debajo, la espina y los dientes se funden.
- **Colores permitidos**: terracota `#8a3722` sobre crema/blanco, o crema `#faf8f3` sobre terracota deep `#4a1e13`. Nada más.
- **No permitido**: sombras, gradientes, contornos extra, rotar el logo, separar el bow del resto, agregar texto dentro del bow, rellenar las casas con color.

## Anti-patrones (qué NO hacer)

| Mal uso | Por qué |
|---------|---------|
| Rellenar el bow con color sólido | Rompe la simetría "ring abierto", el cerebro lo lee como botón |
| Cambiar las casas por arcos curvos | Vuelve abstracto lo concreto — perdés la asociación con vivienda |
| Usar el monograma en azul, verde u otro color | Diluye la asociación de color (terracota = Llave) |
| Estirar la espina hacia la izquierda | Genera ruido visual, ya no se lee L |
| Reemplazar el monograma por un emoji 🔑 | Compite con la marca, baja la propiedad visual |

## Versiones disponibles

Implementadas en `src/components/llave-logo.tsx`:

- `<LlaveLogo />` — toma color de `currentColor`. Úsalo dentro de cualquier componente que ya tenga el color correcto en su contexto.
- `<LlaveLogoMark ink="#8a3722" />` — versión con color explícito. Úsalo en lugares fuera de la cadena de `color` (next/og, emails, decks).

El favicon dinámico (`src/app/icon.tsx`) y la imagen Open Graph (`src/app/opengraph-image.tsx`) embeben el SVG manualmente con los colores correctos.
