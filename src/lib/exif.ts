/**
 * Minimal JPEG EXIF GPS extractor — no external deps.
 *
 * Parses the APP1 segment, walks IFD0 for the GPSInfo pointer (0x8825) and
 * reads GPSLatitudeRef / GPSLatitude / GPSLongitudeRef / GPSLongitude from
 * the GPS IFD. Converts DMS rationals to decimal degrees.
 *
 * Designed for camera/phone JPEGs uploaded by the asesor in /asesor/publicar.
 * Returns null when the file is not JPEG or has no GPS metadata.
 */

export type ExifLocation = {
  lat: number;
  lng: number;
  /** When the image was taken (camera local time, not tz-aware). */
  takenAt?: string;
} | null;

const TAG_GPS_INFO = 0x8825;
const TAG_DATE_TIME_ORIGINAL = 0x9003;
const TAG_EXIF_IFD = 0x8769;

export async function extractGpsFromImage(file: File): Promise<ExifLocation> {
  if (!file.type.startsWith("image/")) return null;
  // EXIF lives at the start of the file; 256 KB is more than enough.
  const buf = await file.slice(0, 256 * 1024).arrayBuffer();
  const view = new DataView(buf);
  if (view.byteLength < 4) return null;
  // JPEG SOI
  if (view.getUint16(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset < view.byteLength - 4) {
    if (view.getUint8(offset) !== 0xff) return null;
    const marker = view.getUint8(offset + 1);
    const segLen = view.getUint16(offset + 2);
    if (marker === 0xe1) {
      // APP1 — verify "Exif\0\0"
      if (view.getUint32(offset + 4) === 0x45786966 && view.getUint16(offset + 8) === 0x0000) {
        return parseTiff(view, offset + 10);
      }
    }
    if (segLen < 2) return null;
    offset += 2 + segLen;
  }
  return null;
}

function parseTiff(view: DataView, tiffStart: number): ExifLocation {
  const byteOrder = view.getUint16(tiffStart);
  const little = byteOrder === 0x4949;
  const get16 = (o: number) => view.getUint16(o, little);
  const get32 = (o: number) => view.getUint32(o, little);
  if (get16(tiffStart + 2) !== 0x002a) return null;

  const ifd0Offset = get32(tiffStart + 4);
  const ifd0 = tiffStart + ifd0Offset;
  if (ifd0 + 2 > view.byteLength) return null;
  const count0 = get16(ifd0);

  let gpsOffset = 0;
  let exifOffset = 0;
  for (let i = 0; i < count0; i++) {
    const entry = ifd0 + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = get16(entry);
    if (tag === TAG_GPS_INFO) gpsOffset = get32(entry + 8);
    else if (tag === TAG_EXIF_IFD) exifOffset = get32(entry + 8);
  }

  let takenAt: string | undefined;
  if (exifOffset) {
    const exifIfd = tiffStart + exifOffset;
    if (exifIfd + 2 <= view.byteLength) {
      const exCount = get16(exifIfd);
      for (let i = 0; i < exCount; i++) {
        const entry = exifIfd + 2 + i * 12;
        if (entry + 12 > view.byteLength) break;
        const tag = get16(entry);
        if (tag === TAG_DATE_TIME_ORIGINAL) {
          const cnt = get32(entry + 4);
          const valOff = tiffStart + get32(entry + 8);
          if (cnt > 0 && valOff + cnt <= view.byteLength) {
            const bytes = new Uint8Array(view.buffer, view.byteOffset + valOff, cnt - 1);
            takenAt = new TextDecoder().decode(bytes);
          }
          break;
        }
      }
    }
  }

  if (!gpsOffset) return null;

  const gpsIfd = tiffStart + gpsOffset;
  if (gpsIfd + 2 > view.byteLength) return null;
  const gpsCount = get16(gpsIfd);

  let latRef = "";
  let lngRef = "";
  let latVals: number[] = [];
  let lngVals: number[] = [];

  for (let i = 0; i < gpsCount; i++) {
    const entry = gpsIfd + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = get16(entry);
    const type = get16(entry + 2);
    const cnt = get32(entry + 4);
    const inlineOrOff = entry + 8;

    if (tag === 0x0001) {
      latRef = String.fromCharCode(view.getUint8(inlineOrOff));
    } else if (tag === 0x0003) {
      lngRef = String.fromCharCode(view.getUint8(inlineOrOff));
    } else if (tag === 0x0002 && (type === 5 || type === 10) && cnt === 3) {
      const off = tiffStart + get32(inlineOrOff);
      latVals = readRationals(view, off, 3, little);
    } else if (tag === 0x0004 && (type === 5 || type === 10) && cnt === 3) {
      const off = tiffStart + get32(inlineOrOff);
      lngVals = readRationals(view, off, 3, little);
    }
  }

  if (latVals.length !== 3 || lngVals.length !== 3) return null;
  let lat = latVals[0] + latVals[1] / 60 + latVals[2] / 3600;
  let lng = lngVals[0] + lngVals[1] / 60 + lngVals[2] / 3600;
  if (latRef === "S") lat = -lat;
  if (lngRef === "W") lng = -lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng, takenAt };
}

function readRationals(view: DataView, offset: number, count: number, little: boolean): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const o = offset + i * 8;
    if (o + 8 > view.byteLength) break;
    const num = view.getUint32(o, little);
    const den = view.getUint32(o + 4, little);
    out.push(den ? num / den : 0);
  }
  return out;
}

/**
 * Reverse geocode via Nominatim (OpenStreetMap). No API key. Returns a short
 * neighbourhood + city label. Network may fail in restricted environments —
 * callers should treat null as "not resolved" and fall back to raw coords.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<{ neighbourhood?: string; city?: string; state?: string; label: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}&format=json&zoom=15&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "es" },
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const a = (data as { address?: Record<string, string> }).address ?? {};
    const neighbourhood =
      a.neighbourhood || a.suburb || a.quarter || a.city_district || a.residential;
    const city = a.city || a.town || a.village || a.municipality || a.county;
    const state = a.state || a.region;
    const label =
      [neighbourhood, city].filter(Boolean).join(", ") ||
      (data as { display_name?: string }).display_name ||
      `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return { neighbourhood, city, state, label };
  } catch {
    return null;
  }
}
