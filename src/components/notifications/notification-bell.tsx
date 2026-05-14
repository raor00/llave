import Link from "next/link";
import { listNotifications, unreadCount, type Role } from "@/lib/notifications/queries";
import { NotificationBellShell } from "./notification-bell-shell";

/**
 * Server-rendered notification bell. Reads the user's notifications and the
 * unread count, then hands the data to the client shell which handles the
 * open/close UI and the (best-effort) browser push permission flow.
 *
 * Push notifications real (Web Push API + service worker + VAPID) viven en el
 * roadmap; este componente ya pide permiso al usuario y emite notificaciones
 * "local" (Notification API) cuando hay novedades sin recargar la página,
 * para que la experiencia se sienta nativa en el demo.
 */
export async function NotificationBell({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) {
  const [items, unread] = await Promise.all([
    listNotifications({ userId, role, limit: 12 }),
    unreadCount({ userId, role }),
  ]);
  return <NotificationBellShell role={role} unread={unread} items={items} />;
}

export function NotificationItem({ item }: { item: Awaited<ReturnType<typeof listNotifications>>[number] }) {
  const ts = timeAgo(item.created_at);
  return (
    <Link
      href={item.link ?? "#"}
      className={`block px-4 py-3 hover:bg-[color:var(--color-brand-50)] transition border-b border-[color:var(--color-border)] ${item.read ? "" : "bg-[color:var(--color-brand-50)]/40"}`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1 size-2 rounded-full shrink-0 ${item.read ? "bg-[color:var(--color-border)]" : "bg-[color:var(--color-brand-500)]"}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[color:var(--color-fg)] truncate">{item.title}</div>
          {item.body && <div className="text-xs text-[color:var(--color-fg-muted)] mt-0.5 line-clamp-2">{item.body}</div>}
          <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)] mt-1">{ts}</div>
        </div>
      </div>
    </Link>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  return `Hace ${d} d`;
}
