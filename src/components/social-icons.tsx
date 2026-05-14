/**
 * Brand-faithful SVG glyphs for the social networks Llave integrates with on
 * the asesor side (Meta Ads, Instagram, Facebook, TikTok, WhatsApp, X/Twitter).
 * Single-color (currentColor) so each consumer controls the tint via
 * Tailwind `text-*`. Sized through the `size` prop (default 18).
 *
 * No outside dependency (no react-icons / lucide for these glyphs) — keeps the
 * client bundle slim and the marks rendered locally without network fetches.
 */

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Zm0 1.5A3 3 0 0 0 4 7v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm10 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
    </Base>
  );
}

export function IconFacebook(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.79l-.45 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </Base>
  );
}

export function IconTikTok(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16.5 2.5h-2.6v12.4a2.7 2.7 0 1 1-2.7-2.7c.27 0 .53.04.78.11V9.6a5.3 5.3 0 1 0 5.22 5.3V8.7a6.9 6.9 0 0 0 3.8 1.16V7.18a4.3 4.3 0 0 1-4.5-4.68Z" />
    </Base>
  );
}

export function IconWhatsapp(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12.04 2.5a9.46 9.46 0 0 0-8 14.5L2.5 21.5l4.62-1.51a9.46 9.46 0 1 0 4.92-17.49Zm5.55 13.51c-.24.68-1.4 1.32-1.94 1.36-.5.05-1.14.07-1.83-.12-.42-.13-.96-.31-1.65-.6-2.92-1.27-4.83-4.2-4.97-4.4-.15-.2-1.19-1.58-1.19-3.01s.75-2.14 1.01-2.43c.27-.29.58-.36.78-.36l.55.01c.18.01.41-.07.64.49.24.59.82 2.04.89 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.45.54-.15.15-.3.3-.13.6.18.29.78 1.28 1.67 2.07 1.15 1.02 2.12 1.34 2.42 1.49.3.15.47.13.65-.08.18-.21.74-.86.94-1.16.2-.3.4-.25.66-.15.27.09 1.74.82 2.03.97.3.15.49.22.56.34.07.12.07.71-.17 1.39Z" />
    </Base>
  );
}

export function IconX(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.7 21.75H1.39l7.73-8.836L.964 2.25H7.79l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </Base>
  );
}

export function IconMeta(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12.13 4.5C7.83 4.5 5.4 8.4 4.45 11.27c-.5 1.5-.7 2.86-.7 3.91 0 2.16 1.13 4.32 3.5 4.32 1.71 0 3.2-1.46 4.7-3.82.83-1.29 1.51-2.51 2.05-3.5.58.94 1.32 2.06 2.21 3.29 1.46 2 2.78 4.03 4.7 4.03 2.16 0 3.34-1.84 3.34-4.13 0-3.79-2.6-10.87-8.21-10.87-2.62 0-4.93 1.94-6.5 4.27.99-1.32 2.7-3.5 5.4-3.5 2.7 0 4.84 2.05 6.07 5.41-2.21-3.42-3.95-5.18-7.88-5.18Z" />
    </Base>
  );
}

export function IconAdsCampaign(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 10v4l13 6V4L3 10Zm15 1a3 3 0 0 0 0-2v2Zm-1 9 .5 1.5a1.5 1.5 0 0 0 2.83-1l-1.33-3.96L17 16Z" />
    </Base>
  );
}

export type SocialChannel = "instagram" | "facebook" | "tiktok" | "whatsapp" | "x" | "meta";

const CHANNEL_ICON: Record<SocialChannel, (props: IconProps) => React.JSX.Element> = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  tiktok: IconTikTok,
  whatsapp: IconWhatsapp,
  x: IconX,
  meta: IconMeta,
};

const CHANNEL_TINT: Record<SocialChannel, string> = {
  instagram: "text-[#e1306c]",
  facebook: "text-[#1877f2]",
  tiktok: "text-[#0b1f1c]",
  whatsapp: "text-[#25d366]",
  x: "text-[#0b1f1c]",
  meta: "text-[#1877f2]",
};

export function SocialBadge({
  channel,
  label,
  meta,
  className = "",
}: {
  channel: SocialChannel;
  label: string;
  meta?: string;
  className?: string;
}) {
  const Icon = CHANNEL_ICON[channel];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`size-7 rounded-md grid place-items-center bg-white/10 ${CHANNEL_TINT[channel]}`}>
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold truncate">{label}</div>
        {meta && <div className="text-[10px] text-current/60">{meta}</div>}
      </div>
    </div>
  );
}
