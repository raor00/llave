/**
 * Icon set used across CRM dashboards (asesor + propietario) and the chat
 * composer. Stroke 1.7, rounded caps, currentColor. Keep `size` consistent
 * across calls so vertical alignment in nav lists stays clean.
 */

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function S({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <S {...props}>
      <rect x="3" y="3" width="8" height="9" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" />
    </S>
  );
}

export function IconProperties(props: IconProps) {
  return (
    <S {...props}>
      <path d="M3 21 H21" />
      <path d="M5 21 V11 L12 5 L19 11 V21" />
      <path d="M10 21 V14 H14 V21" />
    </S>
  );
}

export function IconContacts(props: IconProps) {
  return (
    <S {...props}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19.5 C4.5 16 6.5 14.6 9 14.6 C11.5 14.6 13.5 16 14.5 19.5" />
      <circle cx="17" cy="10" r="2.4" />
      <path d="M14.5 19.5 C15.5 17 17 16.2 18 16.2 C19 16.2 20.5 17 21.5 19.5" />
    </S>
  );
}

export function IconLeads(props: IconProps) {
  return (
    <S {...props}>
      <path d="M4 5 H20" />
      <path d="M4 12 H14" />
      <path d="M4 19 H10" />
      <path d="M17 14 L20 17 L17 20" />
      <path d="M14 17 H20" />
    </S>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <S {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10 H21" />
      <path d="M8 3 V7" />
      <path d="M16 3 V7" />
      <circle cx="8.5" cy="14.5" r="0.8" fill="currentColor" />
      <circle cx="12" cy="14.5" r="0.8" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="0.8" fill="currentColor" />
    </S>
  );
}

export function IconDocument(props: IconProps) {
  return (
    <S {...props}>
      <path d="M6 3 H14 L19 8 V21 H6 Z" />
      <path d="M14 3 V8 H19" />
      <path d="M9 13 H16" />
      <path d="M9 17 H14" />
    </S>
  );
}

export function IconCash(props: IconProps) {
  return (
    <S {...props}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M5.5 9.5 V14.5" />
      <path d="M18.5 9.5 V14.5" />
    </S>
  );
}

export function IconCapture(props: IconProps) {
  return (
    <S {...props}>
      <path d="M4 8 H7 L9 6 H15 L17 8 H20 V18 H4 Z" />
      <circle cx="12" cy="13" r="3.4" />
    </S>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <S {...props}>
      <path d="M12 3 L13.5 9 L20 10.5 L13.5 12 L12 18.5 L10.5 12 L4 10.5 L10.5 9 Z" />
      <path d="M19 4 L19.7 5.8 L21.5 6.5 L19.7 7.2 L19 9 L18.3 7.2 L16.5 6.5 L18.3 5.8 Z" />
    </S>
  );
}

export function IconReport(props: IconProps) {
  return (
    <S {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 17 V12" />
      <path d="M12 17 V8" />
      <path d="M17 17 V14" />
    </S>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <S {...props}>
      <path d="M4 10 V14 L14 19 V5 Z" />
      <path d="M14 9 H17 A3 3 0 0 1 17 15 H14" />
      <path d="M7 14 V18 L10 19 V15" />
    </S>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <S {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 V4.5" />
      <path d="M12 19.5 V22" />
      <path d="M4.2 4.2 L6 6" />
      <path d="M18 18 L19.8 19.8" />
      <path d="M2 12 H4.5" />
      <path d="M19.5 12 H22" />
      <path d="M4.2 19.8 L6 18" />
      <path d="M18 6 L19.8 4.2" />
    </S>
  );
}

export function IconCollapse(props: IconProps) {
  return (
    <S {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4 V20" />
      <path d="M14.5 9 L11.5 12 L14.5 15" />
    </S>
  );
}

export function IconExpand(props: IconProps) {
  return (
    <S {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4 V20" />
      <path d="M11.5 9 L14.5 12 L11.5 15" />
    </S>
  );
}

export function IconMic(props: IconProps) {
  return (
    <S {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11 A7 7 0 0 0 19 11" />
      <path d="M12 18 V22" />
      <path d="M9 22 H15" />
    </S>
  );
}

export function IconMicOff(props: IconProps) {
  return (
    <S {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11 A7 7 0 0 0 19 11" />
      <path d="M12 18 V22" />
      <path d="M9 22 H15" />
      <path d="M4 4 L20 20" stroke="currentColor" strokeWidth="2.2" />
    </S>
  );
}

export function IconSpeaker(props: IconProps) {
  return (
    <S {...props}>
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" />
      <path d="M16 9 A4 4 0 0 1 16 15" />
      <path d="M18.5 6.5 A8 8 0 0 1 18.5 17.5" />
    </S>
  );
}

export function IconSpeakerOff(props: IconProps) {
  return (
    <S {...props}>
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" />
      <path d="M17 10 L21 14" />
      <path d="M21 10 L17 14" />
    </S>
  );
}

export function IconSend(props: IconProps) {
  return (
    <S {...props}>
      <path d="M3 12 L21 4 L17 22 L11 14 Z" />
      <path d="M11 14 L21 4" />
    </S>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <S {...props}>
      <path d="M12 3 V15" />
      <path d="M7 11 L12 16 L17 11" />
      <path d="M5 19 H19" />
    </S>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <S {...props}>
      <path d="M12 17 V5" />
      <path d="M7 9 L12 4 L17 9" />
      <path d="M5 19 H19" />
    </S>
  );
}

export function IconFileText(props: IconProps) {
  return (
    <S {...props}>
      <path d="M6 3 H14 L19 8 V21 H6 Z" />
      <path d="M14 3 V8 H19" />
      <path d="M9 12 H16" />
      <path d="M9 16 H16" />
      <path d="M9 8 H11" />
    </S>
  );
}

export function IconPrint(props: IconProps) {
  return (
    <S {...props}>
      <path d="M7 9 V3 H17 V9" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <rect x="7" y="14" width="10" height="6" />
      <circle cx="17" cy="12" r="0.6" fill="currentColor" />
    </S>
  );
}
