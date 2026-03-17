import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold text-[var(--color-primary)]">
            M. Move
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)]"
            >
              Começar
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Sua evolução começa aqui
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)]">
            Planos de treino personalizados, acompanhamento de progresso e
            suporte com IA. Para alunos, personal trainers e academias.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-md bg-[var(--color-primary)] px-6 py-3 text-base font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)]"
            >
              Criar conta grátis
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-[var(--color-border)] px-6 py-3 text-base font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold md:text-3xl">Planos</h2>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Trial de 14 dias em todos os planos.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  name: "STUDENT",
                  monthly: "R$ 29,90",
                  yearly: "R$ 239,90/ano",
                  desc: "Para quem treina por conta própria",
                },
                {
                  name: "PERSONAL",
                  monthly: "R$ 79,90",
                  yearly: "R$ 639,90/ano",
                  desc: "Até 10 alunos",
                },
                {
                  name: "PERSONAL PRO",
                  monthly: "R$ 129,90",
                  yearly: "R$ 1.039,90/ano",
                  desc: "Até 30 alunos",
                },
                {
                  name: "GYM",
                  monthly: "R$ 199,90",
                  yearly: "R$ 1.498,80/ano",
                  desc: "Até 50 alunos",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-6"
                >
                  <h3 className="font-semibold text-[var(--color-primary)]">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-2xl font-bold">{plan.monthly}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {plan.yearly}
                  </p>
                  <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                    {plan.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Pronto para começar?
            </h2>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Crie sua conta e experimente 14 dias grátis.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-md bg-[var(--color-primary)] px-8 py-3 text-base font-medium text-[var(--color-background)] hover:bg-[var(--color-primary-dark)]"
            >
              Cadastre-se
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[var(--color-text-secondary)]">
          M. Move — Plataforma de gestão de treinos
        </div>
      </footer>
    </div>
  );
}
