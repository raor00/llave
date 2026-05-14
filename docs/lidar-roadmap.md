# Roadmap LiDAR — del Polycam externo al escaneo nativo Llave

Hoy Llave usa Polycam (u otras apps con LiDAR como Scaniverse o Luma AI) para capturar y exportar `.splat` / `.usdz` / `.glb`, que luego se suben a la plataforma. Es el flujo más estable y funciona hoy. Este documento describe cómo eliminar la dependencia de Polycam y tener escaneo LiDAR DENTRO de Llave.

## Por qué no se puede hacer 100% web hoy

iOS Safari **no expone el sensor LiDAR** a páginas web. No existe API estándar. WebXR (16.4+) sólo permite AR placement, no scanning de espacios. Cualquier integración web pura requiere photogrammetry server-side (15-20 fotos → modelo 3D vía servicio externo), lo cual **no usa LiDAR** y da menor calidad/precisión.

## Camino 1 — App Clip + RoomPlan (recomendado)

**Qué es**: un App Clip de Llave (10 MB), sin necesidad de install previo. El usuario lo invoca con NFC tag pegado a la puerta del inmueble, o escaneando un QR en `/asesor/captacion`. iOS abre el App Clip al instante; el usuario escanea el ambiente con RoomPlan (LiDAR Apple); el resultado se POSTea a Llave y reaparece como tour 3D en la publicación.

### Stack
- **Lenguaje**: Swift + SwiftUI
- **APIs**: ARKit, RoomPlan (iOS 16+), URLSession
- **Distribución**: App Clip target dentro de la app principal de Llave en App Store
- **Tamaño**: <10 MB requisito Apple

### Flow técnico

```
NFC tag o QR en /asesor/captacion
        │
        ▼
iOS abre App Clip (https://llave.app/scan?property_id=abc&token=…)
        │
        ▼
RoomPlanCaptureSession → escaneo 30-60 s
        │
        ▼
Export USDZ → POST a https://llave.app/api/scan/upload
{
  property_id: "abc",
  token: "…",         // verifica que el usuario está autenticado
  file: <usdz blob>,
  duration_sec: 47,
  area_m2: 84
}
        │
        ▼
Llave: guarda USDZ en Vercel Blob, actualiza properties.tour_3d_url
        │
        ▼
App Clip redirige a Safari → /inmueble/[id] → tour 3D ya renderiza
```

### Requisitos previos

1. **Apple Developer Account** ($99/año).
2. **App principal en App Store** (puede ser un "shell" mínimo que solo declara el App Clip).
3. **`apple-app-site-association`** servido desde `https://llave.app/.well-known/apple-app-site-association`:
   ```json
   {
     "appclips": { "apps": ["TEAMID.app.llave.Clip"] },
     "applinks": {
       "apps": [],
       "details": [{
         "appID": "TEAMID.app.llave",
         "paths": ["/scan*", "/inmueble/*"]
       }]
     }
   }
   ```
4. **Endpoint server-side** `/api/scan/upload` que acepte multipart con `property_id` y un token de auth, guarde el USDZ en Vercel Blob, y actualice la fila de `properties`.
5. **App Clip Experience** registrada en App Store Connect, con la URL invocadora y los metadatos visibles antes de abrir.

### Tiempo estimado de build

| Hito | Esfuerzo |
|------|----------|
| Apple Dev Account + provisioning | 1 día |
| Shell app + App Clip target en Xcode | 2 días |
| RoomPlan capture flow en Swift | 2 días |
| Endpoint /api/scan/upload + Vercel Blob | 1 día |
| AASA file + App Clip Experience config | 1 día |
| QA real en iPhone Pro / iPad Pro | 1 día |
| Buffer | 2 días |
| **Total** | **~2 semanas** |

### Endpoint server-side a construir

Crear `src/app/api/scan/upload/route.ts`:

```ts
import { put } from "@vercel/blob";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const propertyId = String(form.get("property_id"));
  const token = String(form.get("token"));   // session token del App Clip
  const file = form.get("file") as File;

  // (validar token con Supabase Auth o JWT propio)

  const blob = await put(`scans/${propertyId}-${Date.now()}.usdz`, file, {
    access: "public",
    contentType: "model/vnd.usdz+zip",
  });

  const supa = await createSupabaseServerClient();
  await supa?.from("properties")
    .update({ tour_3d_url: blob.url })
    .eq("id", propertyId);

  return Response.json({ ok: true, url: blob.url });
}
```

## Camino 2 — Photogrammetry web (no usa LiDAR, sólo cámara)

**Cuándo conviene**: usuarios sin iPhone Pro, o si queremos UX 100% web sin native.

### Flow

1. `/asesor/captacion/scan-web` abre la cámara del browser con `getUserMedia({video: { facingMode: 'environment' }})`.
2. UI guía: "Camina alrededor del ambiente y toma 15-20 fotos cubriendo todas las esquinas".
3. Cliente acumula 15-20 frames en blob storage temporal (IndexedDB o memoria).
4. Submit → server POST a Luma AI API o MeshyAI con las fotos.
5. Server poll hasta que el modelo esté listo (~5-10 min).
6. Guarda `splat_url` o `tour_3d_url` en `properties`.
7. Llave renderiza.

### Costo
- Luma AI API: ~$0.50 - $2 por scan
- MeshyAI: precios similares
- COLMAP self-hosted: gratis pero requiere GPU server

### Tiempo build: 2-3 días

## Camino 3 — WebXR (descartado para este use case)

WebXR funciona en iOS Safari 16.4+ pero sólo permite AR placement (poner objetos virtuales sobre cámara) y hit-testing contra superficies planas. **No permite scanning ni reconstrucción de un ambiente**. No sirve para nuestro caso de uso.

## Roadmap recomendado

| Etapa | Camino | Decisión |
|-------|--------|----------|
| Hoy | Polycam externo + drop-zone Llave | Funciona, baja fricción para asesores tech-savvy |
| Sprint 1 (1-2 semanas) | App Clip + RoomPlan | **Recomendado**: elimina la dependencia, LiDAR nativo Apple, UX premium |
| Sprint 2 (2-3 días) | Photogrammetry web | Para asesores con teléfono sin LiDAR, complementa al App Clip |

## Mientras tanto en `/asesor/captacion`

- Detección iOS reciente → muestra banner con Universal Link a Polycam (`https://poly.cam`) que abre la app si está instalada, con fallback a App Store.
- Smart App Banner de Polycam habilitado vía `<meta name="apple-itunes-app" content="app-id=1532482376">` en `layout.tsx`. Safari muestra "OPEN" en la parte superior si Polycam está instalado.
- Upload soporta `.splat`, `.ply`, `.usdz`, `.glb`. Llave renderiza con gsplat (Splat/PLY) o model-viewer (USDZ/GLB).
