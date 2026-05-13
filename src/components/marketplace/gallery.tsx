"use client";

import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border bg-[color:var(--color-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={title} className="size-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-[4/3] overflow-hidden rounded-md border ${i === active ? "ring-2 ring-[color:var(--color-brand-500)]" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} ${i + 1}`} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
