# Cómo probar Llave end-to-end

Guía operativa para validar la landing y la app con usuarios reales (o vos mismo antes del pitch).

---

## 0. Antes de empezar

- URL pública: <https://llave-ruby.vercel.app>
- Local: `pnpm dev` → <http://localhost:3000>
- Asegurate de tener:
  - Cuenta de Anthropic activa (la `ANTHROPIC_API_KEY` ya está en Vercel prod).
  - Navegador moderno (Chrome o Safari — Firefox no soporta Web Speech API).
  - Un teléfono iOS o Android para probar mobile.

---

## 1. Smoke automático (3 minutos)

Después de cualquier deploy:

```bash
for p in / /buscar /chat /asesor /asesor/leads /login /icon /opengraph-image; do
  printf "%-22s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://llave-ruby.vercel.app$p)"
done

curl -s -X POST https://llave-ruby.vercel.app/api/chat \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"id":"u1","role":"user","parts":[{"type":"text","text":"Busco apto en Caracas hasta $300"}]}]}' \
  | head -20
```

**Pasa si**: cada ruta devuelve `200` y la última request muestra al menos un `tool-input-available` seguido por `tool-output-available`.

---

## 2. Flow del inquilino (8 minutos)

### A. Landing → marketplace
1. Abrir `/`. Verificar:
   - Hero 3D rota
   - Headline "Alquilar sin meses adelantados" visible
   - 3 stats (0 meses, 1 mes depósito, 100% reembolsable)
   - Scroll fluido a "El problema", "Manifiesto", "Inmuebles destacados", "Llavero IA", "Roadmap"
2. Click en CTA "Ver inmuebles" → debe llevar a `/buscar`

### B. Filtros del marketplace
1. En `/buscar`, aplicar filtros:
   - Ciudad: Caracas → resultados se reducen
   - Tipo: apartamento → cards filtran
   - Precio máx: 300 → quedan los que entran
   - Habitaciones mín: 2 → último filtro
2. Click en "Limpiar filtros" → vuelve la grilla completa
3. Toggle "Mapa" → ver markers con precio sobre Caracas/Maracaibo/Valencia
4. Click en un marker → popup con foto, título, precio
5. Click en una card → debe ir a `/inmueble/[id]`

### C. Comparador
1. En `/buscar` modo lista, click en "Agregar a comparar" en 2 cards distintas
2. Aparece drawer flotante bottom-right "Comparando 2 inmuebles"
3. Click "Comparar con Llavero" → debe abrir `/chat` con el contexto pre-cargado
4. Llavero invoca tool `compareProperties` → tabla comparativa aparece inline

### D. Detalle del inmueble
1. En `/inmueble/[id]` verificar:
   - Galería de imágenes (clickeable para cambiar la principal)
   - Chips "Sin meses adelantados" + tipo
   - Breakdown de precio vs modelo tradicional ($1120 vs $560)
   - Ficha del asesor María con rating + trust score
2. Click "Preguntale a Llavero" → abre `/chat` con contexto del inmueble

### E. Llavero — búsqueda conversacional
1. En `/chat` (sin contexto), tipear: "Soy estudiante en Mérida con presupuesto $220"
2. Llavero debe llamar `recommendByProfile` y devolver matches con razones
3. Tipear: "Quiero un local de 80m² en Sabana Grande"
4. Debe llamar `searchProperties` con `type=local`
5. Tipear: "Comparame los 2 más baratos de Valencia"
6. Llamada a `compareProperties` con tabla

### F. Modo voz
1. En `/chat` mobile (iOS/Safari): tocar el botón 🎤
2. Hablar: "Busco apartamento dos ambientes en Caracas"
3. El texto debe transcribirse, enviarse, y la respuesta llegar
4. Toggle "🔊 Voz ON" → la próxima respuesta se lee en voz alta

### G. Agendar visita
1. En cualquier conversación con resultados, tipear: "Agendame visita al [primer-uuid-de-resultado], soy Carlos, +58 412-1234567"
2. Llavero llama `scheduleVisit` → card de éxito
3. Ir a `/asesor/leads` → debe aparecer el lead "Carlos González" en la lista

---

## 3. Flow del asesor (5 minutos)

1. Abrir `/asesor` directo (sin login — modo demo)
2. Verificar dashboard:
   - Inmuebles activos ≥ 15
   - Tasa de agendado calculada
   - Tabla con los 12 primeros
3. Click "Publicar con IA" → `/asesor/publicar`
4. Tipear: "Quiero publicar un apto 3 hab en Las Mercedes a $320, con piscina y planta eléctrica"
5. Llavero llama `createPropertyDraft` → card de éxito con link
6. Volver a `/asesor` → el inmueble nuevo aparece arriba en la tabla
7. Click "Sugerime precio para una casa de 4 hab en El Hatillo" → llama `suggestPrice` → rango con comparables
8. Ir a `/asesor/leads` → ver leads anteriores con estado y resumen del agente

---

## 4. Pruebas de regresión (al cambiar código)

```bash
pnpm typecheck    # tsc
pnpm test         # Vitest, 29 aserciones
pnpm build        # build de producción no rompe
```

Si los 3 pasan, podés commitear.

---

## 5. Browsers y dispositivos

| Plataforma | Soporta voz | Pruebas mínimas |
|------------|-------------|------------------|
| Chrome desktop | ✅ | Landing + marketplace + chat texto + chat voz |
| Safari desktop | ✅ | Idem |
| Firefox desktop | ❌ | Landing + marketplace + chat texto |
| Safari iOS | ✅ (mejor) | Toda la app — voz y mapa |
| Chrome Android | ✅ | Toda la app — voz y mapa |

---

## 6. Pruebas de carga (manual, antes del demo)

- Abrir 5 pestañas de `/chat` y mandar mensajes en simultáneo — verificar que cada una responde sin mezclar contextos.
- Abrir `/buscar` con todos los filtros + cambiar entre lista/mapa rápido — no debe haber flicker.
- Recargar `/asesor` 10 veces seguidas — todos los stats deben mantenerse consistentes (porque vienen del mismo seed).

---

## 7. Errores esperados (no son bugs)

- **Firefox + voz**: el botón 🎤 no aparece. Es correcto: Firefox no expone Web Speech API.
- **Sin internet**: el agente cae al mock determinista — sigue respondiendo, sigue llamando tools, pero sin la riqueza de Claude. Mostrar al usuario que es un fallback intencional.
- **Inmueble seedeado borrado**: cualquier inmueble publicado vía `createPropertyDraft` se pierde al reiniciar el server porque el seed in-memory es efímero. Esto se arregla cuando se conecta Supabase de verdad (próximo SDD).

---

## 8. Demo guion de 90 segundos (cuando lo presentás)

| Tiempo | Pantalla | Acción |
|--------|----------|--------|
| 0-10s | `/` | Headline + casa 3D rotando + 3 stats |
| 10-25s | `/` (scroll) | "El problema": $1400 fricción tradicional vs $560 modelo Llave |
| 25-40s | `/chat` | "Busco apto en Caracas hasta $300 con planta eléctrica" — cards inline reales |
| 40-55s | `/chat` | "Comparame los 2 más baratos" — tabla comparativa con chips de "más económico"/"más amplio" |
| 55-70s | `/chat` | "Agendame visita, soy Carlos +58 412-1234567" — lead creado |
| 70-85s | `/asesor` → `/asesor/leads` | El lead nuevo aparece en el CRM |
| 85-90s | `/` (roadmap) | LiDAR 3D, contratos digitales, perfil crediticio |

Ensayalo dos veces antes de presentarlo en vivo. Tener un backup grabado (Loom de 90s) por si la conferencia tiene wifi lento.
