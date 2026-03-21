import Link from "next/link";

/**
 * Página de redefinição de senha (token via query).
 * O fluxo completo (form + POST Better Auth) pode ser evoluído em seguida.
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <h1 className="text-lg font-semibold text-foreground">
          Redefinir senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Use o link enviado por e-mail para concluir a redefinição. Em breve
          você poderá informar a nova senha aqui.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
