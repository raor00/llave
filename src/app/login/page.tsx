"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LlaveLogo } from "@/components/llave-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [mode, setMode] = useState<"magiclink" | "otp">("magiclink");

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      toast.error("Supabase no está configurado. Falta NEXT_PUBLIC_SUPABASE_URL.");
      return;
    }
    setSending(true);
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Te enviamos un magic link y un código. Revisa tu correo.");
      setMode("otp");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    setVerifying(true);
    const { error } = await supa.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });
    setVerifying(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Sesión iniciada");
      router.push("/onboarding");
    }
  }

  return (
    <div className="container-x py-16 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold mb-6">
          <LlaveLogo className="size-7 text-[color:var(--color-brand-500)]" />
          Llave
        </Link>
        <h1 className="font-display text-4xl font-bold">Ingresa a tu cuenta</h1>
        <p className="text-[color:var(--color-fg-muted)] mt-2 max-w-md">
          Te enviamos un magic link y un código de 6 dígitos a tu correo. Si eres asesor, accedes al CRM. Si eres
          inquilino, a tu historial de visitas y favoritos. Si eres propietario, a tu panel de inmuebles.
        </p>
        <p className="text-xs text-[color:var(--color-fg-soft)] mt-4">
          ¿El link no abre? Pega el código del correo en el segundo campo. Funciona aunque tu navegador prefetchee links.
        </p>
      </div>

      <div className="space-y-5 max-w-md w-full">
        <form onSubmit={handleMagicLink} className="card p-8">
          <label className="label">Email</label>
          <input
            required
            type="email"
            className="input"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={sending || !email} className="btn btn-primary w-full mt-4">
            {sending ? "Enviando…" : mode === "otp" ? "Reenviar código" : "Enviar magic link + código"}
          </button>
        </form>

        <form onSubmit={handleVerifyOtp} className="card p-8">
          <label className="label">Código de un solo uso (6 dígitos)</label>
          <input
            required
            inputMode="numeric"
            pattern="[0-9]*"
            className="input tracking-[0.4em] font-mono text-center text-lg"
            placeholder="••••••"
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          />
          <button type="submit" disabled={verifying || !email || otp.length < 6} className="btn btn-outline w-full mt-4">
            {verifying ? "Verificando…" : "Ingresar con código"}
          </button>
          <p className="text-xs text-[color:var(--color-fg-soft)] mt-3">
            El código viene en el mismo correo del magic link, debajo del botón "Confirm".
          </p>
        </form>
      </div>
    </div>
  );
}
