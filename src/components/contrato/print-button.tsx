"use client";

import { IconDownload, IconPrint } from "@/components/dashboard-icons";

/**
 * Botón cliente que dispara `window.print()`. Se usa tanto en la página
 * normal (junto a "Volver") como en la página /print (donde además se
 * auto-dispara). Mantener simple — la magia del PDF la hace el navegador
 * con el media query `@media print` definido en globals.css.
 */
export function PrintButton({
  variant = "outline",
  label = "Descargar PDF",
}: {
  variant?: "primary" | "outline";
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-outline"} text-sm`}
    >
      <IconDownload size={16} /> {label}
    </button>
  );
}

export function PrintIconButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-ghost text-sm"
      title="Imprimir"
    >
      <IconPrint size={16} /> Imprimir
    </button>
  );
}
