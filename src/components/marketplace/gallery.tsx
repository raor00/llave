"use client";

import { useState } from "react";

function isVideo(src: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(src);
}

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[active];
  const currentIsVideo = isVideo(current);

  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border bg-[color:var(--color-border)] relative">
        {currentIsVideo ? (
          <video
            src={current}
            controls
            playsInline
            preload="metadata"
            className="size-full object-cover"
            aria-label={title}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={title} className="size-full object-cover" />
        )}
      </div>
      {images.length > 1 && (
        <div
          className="mt-3 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(images.length, 6)}, minmax(0, 1fr))`,
          }}
        >
          {images.map((src, i) => {
            const thumbIsVideo = isVideo(src);
            return (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={`aspect-[4/3] overflow-hidden rounded-md border relative ${
                  i === active ? "ring-2 ring-[color:var(--color-brand-500)]" : ""
                }`}
              >
                {thumbIsVideo ? (
                  <>
                    <video
                      src={src}
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-2xl">
                      ▶
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${title} ${i + 1}`} className="size-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
