"use client";

import { useEffect } from "react";

/**
 * Auto-dispara `window.print()` cuando se monta la página /contrato/[id]/print.
 * Se ejecuta una sola vez. No renderiza nada visible.
 */
export function AutoPrint() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.print();
      } catch {
        /* no-op */
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
