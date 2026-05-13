// Llave logo — "L" monogram fused with a key.
// Venezuelan warmth → global scalability:
//  - Bow: oval (orchid-petal hint, not generic circle)
//  - Shaft: vertical stroke of the letter L
//  - Teeth: 3 soft rounded arches (colonial-Caribbean architecture cue),
//    not generic square notches
//  - Inner accent dot: warm gold (sun)

export function LlaveLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Orchid-petal bow */}
      <ellipse
        cx="12.5"
        cy="9"
        rx="5.2"
        ry="6"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
        transform="rotate(-10 12.5 9)"
      />
      <circle cx="12.5" cy="9" r="1.5" fill="currentColor" />

      {/* Shaft (vertical of L) */}
      <path
        d="M12.5 15.5 V31"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Teeth: 3 soft arches descending (colonial archway feel) */}
      <path
        d="M12.5 31
           Q15 31 16 29 Q17 27 18 29 Q19 31 21 31
           Q23 31 24 29 Q25 27 26 29 Q27 31 29 31
           L31 31"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Same shape rendered with explicit colors — used for OG image & favicon.
export function LlaveLogoMark({
  className,
  primary = "#faf8f3",
  accent = "#f4c95d",
}: {
  className?: string;
  primary?: string;
  accent?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse
        cx="12.5"
        cy="9"
        rx="5.2"
        ry="6"
        stroke={primary}
        strokeWidth="2.6"
        fill="none"
        transform="rotate(-10 12.5 9)"
      />
      <circle cx="12.5" cy="9" r="1.5" fill={accent} />
      <path
        d="M12.5 15.5 V31"
        stroke={primary}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M12.5 31
           Q15 31 16 29 Q17 27 18 29 Q19 31 21 31
           Q23 31 24 29 Q25 27 26 29 Q27 31 29 31
           L31 31"
        stroke={primary}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
