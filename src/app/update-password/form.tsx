"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Formulario que llama `auth.updateUser({ password })`. Se monta tras la
 * redirección del email de recuperación; Supabase ya guardó la sesión en
 * recovery state. Si no hay sesión válida, el botón queda deshabilitado.
 */
export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    // El cliente del navegador procesa el hash y emite un evento. Verificamos
    // que tengamos sesión (de recovery o normal).
    let mounted = true;
    supa.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setReady(true);
    });
    const { data: sub } = supa.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    setBusy(true);
    const { error } = await supa.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contraseña actualizada. Ya puedes entrar.");
    router.push("/onboarding");
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label className="label">Contraseña nueva</label>
        <input
          required
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="input"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Confirma la contraseña</label>
        <input
          required
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="input"
          placeholder="Repítela"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={busy || !ready || !password || password !== confirm}
        className="btn btn-primary w-full"
      >
        {busy ? "Guardando…" : ready ? "Guardar contraseña" : "Validando enlace…"}
      </button>
      {!ready && (
        <p className="text-xs text-[color:var(--color-fg-soft)]">
          Si llegaste aquí sin pasar por el enlace del correo, vuelve a /login y pide otro.
        </p>
      )}
    </form>
  );
}
