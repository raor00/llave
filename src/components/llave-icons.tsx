/**
 * Llave icon set — minimal stroke icons in the brand language.
 *
 * Each glyph follows the logo conventions: 24×24 viewBox, 1.8 stroke,
 * rounded line caps, `currentColor` fill/stroke so the consumer controls
 * the color via Tailwind text-* utilities. Pitched-roof houses echo the
 * monogram-key teeth from `llave-logo.tsx`.
 */

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* Mi Llave dashboard — pitched-roof house with door, same family as logo teeth */
export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 11 L12 4 L20.5 11" />
      <path d="M5.5 10 V20 H18.5 V10" />
      <path d="M10 20 V14 H14 V20" />
    </Svg>
  );
}

/* Ver inmuebles — three pitched-roof houses (echo logo teeth) */
export function IconBuildings(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 20 H21" />
      <path d="M5 20 V13 L8 10 L11 13 V20" />
      <path d="M11 20 V14 L14 11.5 L17 14 V20" />
      <path d="M17 20 V15.5 L19 13.8 L21 15.5 V20" />
    </Svg>
  );
}

/* Llavero — small key (orchid-bow + shaft + 2 mini teeth) */
export function IconKey(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="8" cy="9" rx="4.2" ry="4.8" transform="rotate(-12 8 9)" />
      <circle cx="8" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <path d="M8 13.8 V21 H21" />
      <path d="M14 21 V18.5" />
      <path d="M17.5 21 V19" />
    </Svg>
  );
}

/* Edit profile — pencil */
export function IconPencil(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20 L4 16.5 L15.5 5 L19 8.5 L7.5 20 Z" />
      <path d="M13 7.5 L16.5 11" />
    </Svg>
  );
}

/* Logout — door + arrow */
export function IconLogout(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4 H6 V20 H14" />
      <path d="M11 12 H20" />
      <path d="M17 9 L20 12 L17 15" />
    </Svg>
  );
}

/* Chevron down (used as menu trigger affordance) */
export function IconChevronDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 9 L12 16 L19 9" />
    </Svg>
  );
}

/* Search — magnifier */
export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5 L20 20" />
    </Svg>
  );
}
