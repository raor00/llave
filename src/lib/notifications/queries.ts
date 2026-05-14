import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import {
  getNotificationsForRole,
  type Notification,
  type Role,
} from "./seed";

export type { Notification, Role } from "./seed";

/**
 * Read the user's notifications. Falls back to the role-tailored seed when
 * Supabase isn't configured or the user has no notifications yet. Seed
 * entries get the real user_id attached so the UI key stays stable.
 */
export async function listNotifications(args: {
  userId: string;
  role: Role;
  limit?: number;
}): Promise<Notification[]> {
  const { userId, role, limit = 20 } = args;
  const seed = getNotificationsForRole(role)
    .slice(0, limit)
    .map((n) => ({ ...n, user_id: userId }));

  if (!SUPABASE_ENABLED) return seed;
  const supa = await createSupabaseServerClient();
  if (!supa) return seed;

  const { data, error } = await supa
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) return seed;
  return data as unknown as Notification[];
}

/** Quick unread count for the bell badge. */
export async function unreadCount(args: {
  userId: string;
  role: Role;
}): Promise<number> {
  const list = await listNotifications(args);
  return list.filter((n) => !n.read).length;
}
