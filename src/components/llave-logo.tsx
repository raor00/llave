// Llave logo — "L" monogram fused with a key whose teeth are tiny houses.
//   Bow:    elegant oval (orchid petal hint), single tint, no inner dot.
//   Shaft:  vertical stroke (the L vertical, also the key shaft).
//   Spine:  horizontal stroke at the bottom (key spine).
//   Teeth:  three pitched-roof houses stepping down in size, sitting on the spine.
// One ink only (deep emerald) for total coherence.

export function LlaveLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Bow — orchid-petal oval, tilted slightly */}
      <ellipse
        cx="12"
        cy="9"
        rx="5.2"
        ry="6"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
        transform="rotate(-10 12 9)"
      />

      {/* Shaft */}
      <path
        d="M12 15 V31"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Spine (key body) */}
      <path
        d="M12 31 H31"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* House 1 — tallest */}
      <path
        d="M15.5 31 V26.2 L17.4 24 L19.3 26.2 V31"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />

      {/* House 2 — medium */}
      <path
        d="M21.4 31 V27.4 L22.9 25.6 L24.4 27.4 V31"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />

      {/* House 3 — smallest */}
      <path
        d="M26.5 31 V28.3 L27.7 26.9 L28.9 28.3 V31"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Coloreable variant — used by next/og where currentColor is not available.
export function LlaveLogoMark({
  className,
  ink = "#8a3722",
}: {
  className?: string;
  ink?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse
        cx="12"
        cy="9"
        rx="5.2"
        ry="6"
        stroke={ink}
        strokeWidth="2.6"
        fill="none"
        transform="rotate(-10 12 9)"
      />
      <path d="M12 15 V31" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 31 H31" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M15.5 31 V26.2 L17.4 24 L19.3 26.2 V31"
        stroke={ink}
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21.4 31 V27.4 L22.9 25.6 L24.4 27.4 V31"
        stroke={ink}
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26.5 31 V28.3 L27.7 26.9 L28.9 28.3 V31"
        stroke={ink}
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
