"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LlaveLogo } from "@/components/llave-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      toast.error("Supabase no está configurado. Agregá NEXT_PUBLIC_SUPABASE_URL en .env.local");
      return;
    }
    setSending(true);
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/asesor` },
    });
    setSending(false);
    if (error) toast.error(error.message);
    else toast.success("Te enviamos un magic link. Revisá tu correo.");
  }

  return (
    <div className="container-x py-16 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold mb-6">
          <LlaveLogo className="size-7 text-[color:var(--color-brand-500)]" />
          Llave
        </Link>
        <h1 className="font-display text-4xl font-bold">Ingresá a tu cuenta</h1>
        <p className="text-[color:var(--color-fg-muted)] mt-2 max-w-md">
          Magic link a tu correo. Si eres asesor, accedes al CRM. Si eres inquilino, a tu historial de visitas y favoritos.
        </p>
      </div>
      <form onSubmit={handleLogin} className="card p-8 max-w-md w-full">
        <label className="label">Email</label>
        <input
          required
          type="email"
          className="input"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={sending} className="btn btn-primary w-full mt-4">
          {sending ? "Enviando…" : "Enviar magic link"}
        </button>
        <p className="text-xs text-[color:var(--color-fg-soft)] mt-4">
          Demo sin Supabase configurado: el panel de asesor es accesible directo en
          <code className="ml-1">/asesor</code> para testing.
        </p>
      </form>
    </div>
  );
}
