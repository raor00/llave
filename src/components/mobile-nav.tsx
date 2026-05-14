"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Mobile-only hamburger nav. The desktop nav lives in the header as a static
 * `<nav>` with `hidden md:flex`. On `< md` we render this drawer trigger
 * instead so users on phones can reach the role-aware links without
 * relying on the avatar dropdown.
 */
export function MobileNav({
  items,
}: {
  items: Array<{ href: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden size-9 rounded-md border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg)] grid place-items-center text-[color:var(--color-fg)]"
        aria-label="Abrir menú"
      >
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-[color:var(--color-border)] shadow-[var(--shadow-pop)] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[color:var(--color-border)]">
              <span className="font-display font-bold text-lg">Menú</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-9 rounded-md hover:bg-[color:var(--color-bg)] grid place-items-center text-[color:var(--color-fg-soft)]"
                aria-label="Cerrar"
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="py-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-brand-50)] border-b border-[color:var(--color-border)] last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
