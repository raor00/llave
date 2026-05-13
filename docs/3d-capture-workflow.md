# Captación 3D — workflow

Llave embebe tours 3D directamente en el detalle del inmueble. Soportamos tres tecnologías, en orden de calidad y facilidad:

## 1. Gaussian Splatting (recomendado)

Es la tecnología que usan SuperSplat (PlayCanvas), Luma AI, Polycam Splat. Captura el ambiente como una nube de gaussianas 3D que se renderiza con WebGL en cualquier navegador moderno — incluso sin LiDAR.

### Qué necesitás
- Cualquier teléfono moderno (no hace falta iPhone Pro).
- Una app de captura: **Scaniverse**, **Polycam**, **Luma AI**, **Postshot**.

### Cómo capturar
1. Abrí la app y elegí el modo "Gaussian Splat" o "3D Capture".
2. Caminá alrededor del ambiente filmando lento, cubriendo techos y esquinas.
3. La app procesa en la nube (5-30 min) y exporta `.splat` o `.ply`.
4. En Llave: `/asesor/captacion` → "Subir .splat / .ply / USDZ / GLB" → seleccionás el archivo.
5. Publicás. El detalle del inmueble ya muestra el tour 3D recorrible.

### Renderer interno
- Componente: `src/components/marketplace/splat-viewer.tsx`
- Librería: `gsplat` (~100 KB, sin deps).
- Carga progresiva con barra de % mientras descarga.
- Orbit controls (drag para rotar, scroll para zoom, pinch en mobile).
- Funciona en Chrome, Safari (incluyendo iOS 16+), Firefox.

### Cuándo elegirlo
- **Default**. Mejor calidad fotorrealista. Funciona en cualquier teléfono. Render instantáneo en el browser.

---

## 2. USDZ (iPhone Pro / iPad Pro con LiDAR)

Formato nativo de Apple para AR. Más liviano que un Splat, soporta AR Quick Look (botón "Ver en mi espacio" desde Safari iOS).

### Qué necesitás
- iPhone Pro / iPad Pro 2020+ con LiDAR.
- App: **Polycam** o **Reality Composer**.

### Cómo capturar
1. Abrí Polycam → modo "LiDAR" → escaneá moviendo el dispositivo.
2. Procesá en device (~30 s).
3. Exportá como USDZ.
4. Subí en `/asesor/captacion`.

### Renderer
- Componente: `src/components/marketplace/tour-3d.tsx`
- Librería: `<model-viewer>` de Google (CDN, lazy-loaded).
- AR Quick Look automático en iOS.

---

## 3. GLB (RoomPlan / Reality Composer Pro)

Formato 3D estándar, más portable que USDZ. Útil para asesores que ya tienen modelos generados por arquitectos.

### Qué necesitás
- iPhone con LiDAR + RoomPlan o un modelo GLB de cualquier fuente.

### Renderer
- Mismo `<model-viewer>` que USDZ.

---

## Cómo decide Llave qué viewer mostrar

En `src/app/inmueble/[id]/page.tsx`:

```tsx
{property.splat_url && <SplatViewer ... />}
{property.tour_3d_url && !property.splat_url && <Tour3D ... />}
```

Prioridad: Gaussian Splat > USDZ/GLB. Si hay ambos, gana Splat (más inmersivo).

## Storage

- Hackathon: las URLs apuntan a CDNs públicos o archivos hospedados externamente. En producción se sube a **Vercel Blob** (`@vercel/blob`).
- Roadmap: integración directa de upload-to-Blob desde la captación, con compresión Draco para GLB y conversión opcional de USDZ ↔ GLB.

## Costos y límites

- `.splat`: típicamente 30-200 MB para una habitación. La descarga es directa al navegador.
- `.usdz`: 5-50 MB.
- `.glb`: 2-30 MB.
- Sin transformación server-side: el costo es el storage + bandwidth del CDN.

## Demo seedeado

El inmueble "Apartamento luminoso en Las Mercedes" (primer item del seed) trae un `splat_url` apuntando a un splat público de prueba (`huggingface.co/cakewalk/splat-data/nike.splat`). No es un apartamento — es la zapatilla Nike que viene de demo con `gsplat`. Sirve para probar que el viewer carga sin errores. En producción se reemplaza por una captura real del inmueble.
