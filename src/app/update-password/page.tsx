import { UpdatePasswordForm } from "./form";

export const dynamic = "force-dynamic";

/**
 * Landing del enlace de recuperación de contraseña. Supabase deposita un
 * `access_token` en el hash de la URL (#access_token=...&type=recovery);
 * el browser client lo detecta automáticamente y deja al usuario en
 * estado de recovery — desde ahí podemos hacer auth.updateUser({password}).
 */
export default function UpdatePasswordPage() {
  return (
    <div className="container-x py-16">
      <div className="max-w-md mx-auto card p-8">
        <h1 className="font-display text-2xl font-bold">Crea una contraseña nueva</h1>
        <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
          Escribe la contraseña que vas a usar para entrar a Llave.
        </p>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
