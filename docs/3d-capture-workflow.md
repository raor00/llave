# Captación 3D — workflow operativo

Llave muestra tours 3D en el detalle de cada inmueble (`/inmueble/[id]`). El caso usado en el hackathon es **“Llave: Comedor Fina — vive donde Llave fue construida”** y funciona con un archivo **GLB real** ubicado en:

- `public/inmuebles/comedor/loft-hackathon-tour.glb`
- Tamaño actual: ~19 MB
- Formato: glTF binary 2.0 (`.glb`)
- Texturas: JPEG embebidas
- Registro del inmueble: `src/lib/db/seed-data.ts`
- Campo usado: `tour_3d_url: "/inmuebles/comedor/loft-hackathon-tour.glb"`

## Cómo funciona hoy en el repo

El modelo de datos tiene dos campos conceptuales:

- `tour_3d_url`: URL para Polycam embed, `.glb`, `.gltf` o `.usdz`.
- `splat_url`: URL para Gaussian Splat (`.splat`) o PLY usado como splat/mesh según renderer.

El detalle del inmueble decide el viewer en `src/app/inmueble/[id]/page.tsx`:

1. Si `tour_3d_url` es un link de `poly.cam`, usa `PolycamEmbed`.
2. Si la URL final termina en `.splat`, usa `SplatViewer` con `gsplat`.
3. Si termina en `.ply`, usa `MeshViewer` con `PLYLoader` y modo walkthrough.
4. Para `.glb`, `.gltf` o `.usdz`, usa `Tour3D`, que carga `<model-viewer>` desde CDN.

Para **Comedor Fina**, la ruta real es la opción 4: **GLB + `<model-viewer>`**.

## Estado real vs. promesa de producto

Hoy la plataforma **renderiza** tours 3D si el inmueble tiene una URL cargada. La captación y edición web aceptan una **URL pública** de Polycam o de un archivo `.glb`, `.gltf`, `.usdz`, `.ply` o `.splat`.

Lo que todavía NO existe es upload binario directo desde la web a storage. Por ahora el archivo se sube fuera de Llave —Supabase Storage, Vercel Blob, S3/R2 o Polycam share— y en Llave se pega la URL final.

La inconsistencia original del schema (`splat_url` usado por código pero ausente en `0001_init.sql`) queda corregida agregando `splat_url` al schema inicial y una migración idempotente `0004_add_splat_url.sql` para despliegues existentes.

## Mejor formato recomendado

### Recomendación principal: GLB optimizado para web

Para Llave, el formato operativo más conveniente es **`.glb` optimizado**.

Por qué:

- Funciona en desktop, Android y iOS dentro del navegador.
- Lo renderiza `<model-viewer>` sin construir un motor propio.
- Puede viajar en una sola URL pública.
- Es más fácil de comprimir, cachear y versionar que un `.usdz`.
- Sirve perfecto para la ficha del inmueble: vista 3D orbitable, rápida y compartible.

Target técnico recomendado:

- Formato: `.glb`
- Tamaño ideal: 10–30 MB por ambiente principal
- Texturas: JPEG/WebP comprimidas
- Geometría: simplificada si el export sale pesado
- Hosting: Vercel Blob o Supabase Storage con URL pública/CDN
- Campo DB: `properties.tour_3d_url`

### Complemento para iPhone: USDZ

`.usdz` conviene cuando querés AR Quick Look en iOS. No debería ser el único formato porque es menos universal para web.

Uso recomendado:

- Captura LiDAR/RoomPlan en iPhone Pro.
- Exportar `.usdz` como archivo fuente nativo.
- Convertir o exportar también `.glb` para web.
- Guardar `.glb` en `tour_3d_url`; opcionalmente guardar `.usdz` en un campo futuro `tour_3d_ios_url` si queremos AR dedicado.

### Gaussian Splat: mejor experiencia visual, peor operación

`.splat` puede verse más fotorrealista, pero pesa más y requiere más cuidado de captura/procesado. Conviene como formato premium para inmuebles top, no como default operativo.

Uso recomendado:

- Campo: `splat_url`
- Viewer: `SplatViewer`
- Tamaño esperado: 30–200 MB por ambiente
- Ideal para: espacios icónicos, penthouses, casas grandes, marketing premium

## Workflow manual recomendado hoy

Este es el flujo que ya se puede operar sin app nativa propia:

1. Abrir Polycam, Scaniverse o Luma en el iPhone.
2. Escanear el ambiente principal con movimiento lento, cubriendo esquinas, techo, piso y ventanas.
3. Exportar como **GLB** si la app lo permite.
4. Si sólo exporta USDZ, convertir a GLB antes de subirlo.
5. Optimizar el GLB antes de publicarlo:
   - comprimir texturas,
   - simplificar geometría,
   - evitar archivos mayores a ~30 MB salvo casos premium.
6. Subir el archivo a Vercel Blob o Supabase Storage.
7. Guardar la URL pública en `properties.tour_3d_url` del inmueble correcto.
8. Abrir `/inmueble/[id]` y validar que `<model-viewer>` cargue el tour.

## Ruta clara para optimizar desde iPhone hasta inmueble correcto

La mejor ruta de producto es **App Clip + RoomPlan + upload directo**.

Flujo ideal:

```mermaid
flowchart TD
  A[Asesor abre inmueble en Llave] --> B[Botón: Escanear con iPhone]
  B --> C[QR / Universal Link con property_id y token]
  C --> D[App Clip de Llave]
  D --> E[RoomPlan captura el espacio con LiDAR]
  E --> F[Export USDZ]
  F --> G[POST /api/scan/upload]
  G --> H[Storage: Vercel Blob o Supabase Storage]
  H --> I[Actualizar properties.tour_3d_url]
  I --> J[/inmueble/id muestra el tour]
```

El punto CLAVE es que el link de escaneo tiene que llevar:

- `property_id`: inmueble que recibirá el tour.
- `upload_token`: token corto, firmado y de un solo uso.
- `owner_id` o sesión Supabase para validar permisos.

Ejemplo conceptual:

```txt
https://llave.app/scan?property_id=seed-llave-comedor-fina-vive-donde-llave-fue-construida&token=SIGNED_UPLOAD_TOKEN
```


## Ruta Polycam para el escaneo que ya hiciste

Como hoy Llave es 100% web, el flujo correcto NO es intentar escanear desde Safari. Safari puede abrir cámara/fotos, pero **no expone LiDAR ni RoomPlan** a una página web. El LiDAR se usa desde una app nativa como Polycam, Scaniverse o una futura App Clip de Llave.

Para tu escaneo de Polycam, seguí esta ruta:

1. Abrí el scan en **Polycam**.
2. Entrá al editor del scan y usá **Crop / Edit** para recortar:
   - elimina personas, techo/suelo excesivo y paredes de ambientes que no querés publicar;
   - deja sólo el comedor/ambiente que representa el inmueble;
   - revisa que la mesa, paredes y puntos de referencia no queden cortados;
   - guardá una copia antes de recortar fuerte, porque recortar de más rompe la orientación del tour.
3. Si el scan viene de LiDAR, exportá primero **GLB** si Polycam te lo permite. Si el resultado visual queda pobre, exportá también USDZ como respaldo.
4. Si capturaste en modo Gaussian/Splat, exportá `.splat` sólo si el archivo queda razonable para web. Para una primera versión del producto, GLB es más fácil de operar.
5. Subí el archivo final a un storage público: Supabase Storage, Vercel Blob, S3/R2 o temporalmente un CDN confiable.
6. Copiá la URL pública del archivo. Debe abrir directamente el archivo, no una página intermedia.
7. En Llave: `/asesor/captacion` o `/asesor/inmuebles/[id]/editar` → pegá la URL en **URL del tour 3D**.
8. Guardá y abrí `/inmueble/[id]` para validar el render.

Regla simple:

- Link de Polycam público → se guarda en `tour_3d_url` y se muestra con `PolycamEmbed`.
- `.glb`, `.gltf`, `.usdz`, `.ply` → se guarda en `tour_3d_url`.
- `.splat` → se guarda en `splat_url`.

## Checklist de captura en Polycam

Antes de escanear:

- prendé todas las luces;
- abrí cortinas si hay luz natural suave, pero evitá ventanas quemadas;
- quitá objetos personales, vasos, cables y gente en movimiento;
- empezá desde una esquina con buena vista del ambiente completo.

Durante el escaneo:

- movete lento, como si estuvieras pintando el espacio con la cámara;
- hacé una vuelta completa al ambiente;
- cubrí esquinas, debajo de mesas y transiciones de pared/piso;
- no hagas paneos bruscos;
- si el ambiente es grande, dividilo en zonas y evitá perder tracking.

Después del escaneo:

- recortá antes de exportar;
- generá una versión web liviana;
- probá en Safari iPhone y Chrome desktop;
- si tarda demasiado, bajá calidad/texturas o separá por ambientes.

## Ruta web actual sin app de Llave

La ruta realista para producción web es:

```mermaid
flowchart TD
  A[Asesor escanea en Polycam iPhone] --> B[Recorta en Polycam]
  B --> C[Exporta GLB optimizado]
  C --> D[Sube a Supabase Storage o Vercel Blob]
  D --> E[Copia URL pública]
  E --> F[Pega URL en captación o edición web]
  F --> G[Llave guarda tour_3d_url o splat_url]
  G --> H[/inmueble/id renderiza el viewer correcto]
```

Este flujo es menos mágico que App Clip, pero es el correcto ahora. Primero tubería confiable; después automatización. Si intentamos saltar directo a “LiDAR desde navegador”, estamos construyendo sobre una API que no existe.

## Endpoint necesario

Crear un endpoint server-side:

- Ruta: `src/app/api/scan/upload/route.ts`
- Método: `POST multipart/form-data`
- Recibe: `property_id`, `token`, `file`, `format`, metadata opcional.
- Valida: token, propiedad existente, permiso del asesor/propietario.
- Sube: archivo a storage.
- Actualiza: `properties.tour_3d_url` o `properties.splat_url`.

Para GLB:

```ts
contentType: "model/gltf-binary"
```

Para USDZ:

```ts
contentType: "model/vnd.usdz+zip"
```

Para Splat:

```ts
contentType: "application/octet-stream"
```

## Cambios mínimos siguientes para cerrar el pipeline

Ya quedó cubierto:

1. `splat_url text` existe en el schema inicial y en una migración idempotente para despliegues existentes.
2. `/asesor/captacion` y `/asesor/inmuebles/[id]/editar` aceptan URL de tour 3D.
3. `.glb`, `.gltf`, `.usdz`, `.ply` y links Polycam se guardan en `tour_3d_url`.
4. `.splat` se guarda en `splat_url`.

Falta para producción completa:

1. Upload binario directo a Supabase Storage o Vercel Blob desde Llave.
2. Validar tamaño máximo antes de aceptar archivos pesados.
3. Generar URL pública automáticamente y asociarla al `property_id`.
4. Agregar botón “Abrir Polycam / App Clip” con retorno al inmueble correcto.

## Decisión recomendada

Para producto real, usar esta jerarquía:

1. **GLB optimizado** como default para todo inmueble.
2. **USDZ** como fuente iOS/AR opcional.
3. **Splat** como upgrade premium para inmuebles que necesitan máximo realismo.
4. **Polycam embed** como solución puente cuando el asesor todavía no exporta archivos.

Esto evita construir una catedral sobre arena: primero un pipeline universal y confiable; después el escaneo nativo premium.

## Importar archivo directo desde Llave web

Para que el asesor no tenga que copiar URLs manualmente, Llave soporta importación directa desde los formularios:

- `/asesor/captacion` → **Importar archivo 3D**.
- `/asesor/inmuebles/[id]/editar` → **Importar archivo 3D**.

El archivo se sube desde el navegador directo a Supabase Storage, bucket público `properties`, bajo `tours/...`. Esto evita pasar archivos pesados por una Server Action o una Function de Vercel, que no es el lugar correcto para mover modelos 3D grandes.

Requisitos:

1. Supabase configurado con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Usuario autenticado.
3. Migraciones aplicadas:
   - `0004_add_splat_url.sql`
   - `0005_storage_policies.sql`

Límite actual en cliente: **250 MB**. Si el archivo pesa más, hay que exportar una versión web más liviana desde Polycam.

## Si en iPhone queda en blanco

Primero verificá el formato:

- Si exportaste **USDZ**, no esperes un tour inline dentro de la ficha. USDZ funciona mejor como **AR Quick Look**. Para verlo dentro de la página, exportá también **GLB/GLTF**.
- Si exportaste **GLB/GLTF** y sigue en blanco, abrí el link directo del archivo desde Safari. Si el link no descarga/abre el modelo directo, entonces no es una URL pública de archivo sino una página intermedia.
- Si el GLB pesa demasiado o tiene texturas enormes, iPhone Safari puede quedarse sin memoria. Re-exportá comprimido, idealmente 10–30 MB para un ambiente.

Llave ahora muestra estado de carga, error y fallback de descarga para que el usuario no vea una tarjeta blanca silenciosa.
