"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LlaveLogo } from "@/components/llave-logo";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    const supa = createSupabaseBrowserClient();
    if (!supa) {
      toast.error("Supabase no está configurado.");
      return;
    }
    setBusy(true);
    const { error } = await supa.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Bienvenido!");
      router.push("/onboarding");
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    setBusy(true);
    const { error } = await supa.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Te enviamos un magic link y un código.");
      setSentOtp(true);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const supa = createSupabaseBrowserClient();
    if (!supa) return;
    setBusy(true);
    const code = otp.trim();
    let res = await supa.auth.verifyOtp({ email, token: code, type: "email" });
    if (res.error) {
      const retry = await supa.auth.verifyOtp({ email, token: code, type: "magiclink" });
      res = retry;
    }
    setBusy(false);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Sesión iniciada");
      router.push("/onboarding");
    }
  }

  return (
    <div className="container-x py-16 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
      <div>
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold mb-6">
          <LlaveLogo className="size-7 text-[color:var(--color-brand-500)]" />
          Llave
        </Link>
        <h1 className="font-display text-4xl font-bold">
          {mode === "signin" ? "Ingresa a tu cuenta" : "Crea tu cuenta"}
        </h1>
        <p className="text-[color:var(--color-fg-muted)] mt-2 max-w-md">
          {mode === "signin"
            ? "Si ya tienes una contraseña, úsala. Si no, salta a 'Crear cuenta' y te enviamos un código por correo."
            : "Te enviamos un magic link y un código al correo. Después podrás crear una contraseña para entradas rápidas."}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-[color:var(--color-border-strong)] p-1 bg-white">
          <button
            onClick={() => setMode("signin")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              mode === "signin"
                ? "bg-[color:var(--color-brand-500)] text-white"
                : "text-[color:var(--color-fg-muted)]"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              mode === "signup"
                ? "bg-[color:var(--color-brand-500)] text-white"
                : "text-[color:var(--color-fg-muted)]"
            }`}
          >
            Crear cuenta
          </button>
        </div>
      </div>

      <div className="space-y-5 max-w-md w-full justify-self-start">
        {mode === "signin" ? (
          <form onSubmit={handlePasswordSignIn} className="card p-8">
            <label className="label">Email</label>
            <input
              required
              type="email"
              className="input"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="label mt-4">Contraseña</label>
            <input
              required
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy || !email || !password}
              className="btn btn-primary w-full mt-5"
            >
              {busy ? "Entrando…" : "Iniciar sesión"}
            </button>
            <p className="text-xs text-[color:var(--color-fg-soft)] mt-4">
              ¿No tienes contraseña?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[color:var(--color-brand-700)] underline"
              >
                Crear cuenta con magic link
              </button>
            </p>
          </form>
        ) : (
          <>
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
              <button
                type="submit"
                disabled={busy || !email}
                className="btn btn-primary w-full mt-4"
              >
                {busy ? "Enviando…" : sentOtp ? "Reenviar código" : "Enviar magic link + código"}
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
              <button
                type="submit"
                disabled={busy || !email || otp.length < 6}
                className="btn btn-outline w-full mt-4"
              >
                {busy ? "Verificando…" : "Ingresar con código"}
              </button>
              <p className="text-xs text-[color:var(--color-fg-soft)] mt-3">
                El código viene en el mismo correo del magic link. Funciona aunque tu navegador consuma el link por preview.
              </p>
            </form>

            <p className="text-xs text-[color:var(--color-fg-soft)]">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-[color:var(--color-brand-700)] underline"
              >
                Iniciar sesión con contraseña
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
