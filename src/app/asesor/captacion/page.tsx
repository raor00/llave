import { CaptacionForm } from "@/components/asesor/captacion-form";

export const dynamic = "force-dynamic";

export default function CaptacionPage() {
  return (
    <div className="container-x py-10">
      <div className="mb-8">
        <span className="chip mb-2">Captación</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Captar inmueble en sitio</h1>
        <p className="text-[color:var(--color-fg-muted)] mt-2 max-w-2xl">
          Toma las fotos directo desde el teléfono (sin salir de Llave), carga un tour 3D si
          tienes un dispositivo con LiDAR y publícalo en segundos. Si todavía no estás en el inmueble,
          puedes guardar el borrador y completar después.
        </p>
      </div>
      <CaptacionForm />
    </div>
  );
}
