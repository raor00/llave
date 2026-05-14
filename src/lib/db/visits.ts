/**
 * Visitas agendadas del asesor para la página /asesor/visitas.
 *
 * Genera 8-12 visitas deterministas distribuidas en los próximos 7 días,
 * con horarios realistas (mañana/tarde), estados (confirmada/pendiente/
 * cancelada) y anclaje a las propiedades demo. Cuando Supabase esté listo
 * se reemplaza por una query a `leads` con `preferred_visit_at` y join al
 * inmueble.
 */

import { DEMO_PROPERTIES } from "./seed-data";
import type { Property } from "@/lib/types";

export type VisitStatus = "confirmada" | "pendiente" | "cancelada";

export type Visit = {
  id: string;
  property: Property;
  tenant_name: string;
  tenant_phone: string;
  scheduled_at: string; // ISO
  status: VisitStatus;
  note: string | null;
};

const VISIT_SEEDS: Array<{
  tenant_name: string;
  tenant_phone: string;
  dayOffset: number; // 0..6 desde hoy
  hour: number;
  minute: number;
  status: VisitStatus;
  note: string | null;
  propertyIndex: number;
}> = [
  { tenant_name: "Carlos González", tenant_phone: "+58 412-9876543", dayOffset: 0, hour: 10, minute: 30, status: "confirmada", note: "Trae a la pareja", propertyIndex: 0 },
  { tenant_name: "Ana López", tenant_phone: "+58 416-5551234", dayOffset: 0, hour: 16, minute: 0, status: "confirmada", note: "Pidió ver el splat antes", propertyIndex: 3 },
  { tenant_name: "Sofía Hernández", tenant_phone: "+58 424-3344556", dayOffset: 1, hour: 9, minute: 0, status: "pendiente", note: null, propertyIndex: 1 },
  { tenant_name: "Diego Castillo", tenant_phone: "+58 412-2211009", dayOffset: 1, hour: 14, minute: 30, status: "confirmada", note: "Quiere conocer al dueño", propertyIndex: 6 },
  { tenant_name: "Andrés Rivas", tenant_phone: "+58 412-7778899", dayOffset: 2, hour: 11, minute: 0, status: "confirmada", note: null, propertyIndex: 2 },
  { tenant_name: "Valentina Suárez", tenant_phone: "+58 414-6655443", dayOffset: 2, hour: 17, minute: 0, status: "pendiente", note: "Confirmar por WhatsApp", propertyIndex: 9 },
  { tenant_name: "Luis Mendoza", tenant_phone: "+58 416-9988776", dayOffset: 3, hour: 10, minute: 0, status: "confirmada", note: null, propertyIndex: 4 },
  { tenant_name: "María Pérez", tenant_phone: "+58 414-1112233", dayOffset: 3, hour: 15, minute: 30, status: "cancelada", note: "Reagenda para próxima semana", propertyIndex: 5 },
  { tenant_name: "Jorge Salazar", tenant_phone: "+58 412-4422118", dayOffset: 4, hour: 9, minute: 30, status: "confirmada", note: null, propertyIndex: 10 },
  { tenant_name: "Camila Ferrer", tenant_phone: "+58 424-7788991", dayOffset: 4, hour: 16, minute: 0, status: "pendiente", note: null, propertyIndex: 7 },
  { tenant_name: "Ricardo Núñez", tenant_phone: "+58 416-1023456", dayOffset: 5, hour: 11, minute: 0, status: "confirmada", note: "Viene con su esposa y dos niños", propertyIndex: 8 },
  { tenant_name: "Gabriela Romero", tenant_phone: "+58 414-9988221", dayOffset: 6, hour: 10, minute: 0, status: "pendiente", note: null, propertyIndex: 11 },
];

function setTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function listVisits(): Visit[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return VISIT_SEEDS.map((s, i) => {
    const property = DEMO_PROPERTIES[s.propertyIndex % DEMO_PROPERTIES.length];
    const date = new Date(today);
    date.setDate(today.getDate() + s.dayOffset);
    const scheduled = setTime(date, s.hour, s.minute);
    return {
      id: `visit-${i}-${property.id.slice(0, 6)}`,
      property,
      tenant_name: s.tenant_name,
      tenant_phone: s.tenant_phone,
      scheduled_at: scheduled.toISOString(),
      status: s.status,
      note: s.note,
    };
  });
}

export function buildVisitMetrics(visits: Visit[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setDate(today.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const hoy = visits.filter((v) => {
    const d = new Date(v.scheduled_at);
    return d >= today && d < endOfToday;
  }).length;
  const semana = visits.filter((v) => {
    const d = new Date(v.scheduled_at);
    return d >= today && d < endOfWeek;
  }).length;
  const confirmadas = visits.filter((v) => v.status === "confirmada").length;
  const canceladas = visits.filter((v) => v.status === "cancelada").length;
  return { hoy, semana, confirmadas, canceladas };
}

export function groupVisitsByDay(visits: Visit[]): Array<{
  date: Date;
  label: string;
  dayNum: number;
  visits: Visit[];
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const labels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const out: Array<{ date: Date; label: string; dayNum: number; visits: Visit[] }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const dayVisits = visits
      .filter((v) => {
        const vd = new Date(v.scheduled_at);
        return vd >= d && vd < next;
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    out.push({
      date: d,
      label: labels[d.getDay()] ?? "—",
      dayNum: d.getDate(),
      visits: dayVisits,
    });
  }
  return out;
}
