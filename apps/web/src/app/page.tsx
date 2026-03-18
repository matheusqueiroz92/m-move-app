import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">M. Move</span>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Começar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Sua evolução começa aqui
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Planos de treino personalizados, acompanhamento de progresso e
            suporte com IA. Para alunos, personal trainers e academias.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Criar conta grátis</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-muted py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold md:text-3xl">Planos</h2>
            <p className="mt-2 text-muted-foreground">
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
                <Card key={plan.name} className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-primary">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-2xl font-bold">{plan.monthly}</p>
                    <CardDescription>{plan.yearly}</CardDescription>
                    <p className="pt-2 text-sm text-muted-foreground">
                      {plan.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Pronto para começar?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Crie sua conta e experimente 14 dias grátis.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/register">Cadastre-se</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          M. Move — Plataforma de gestão de treinos
        </div>
      </footer>
    </div>
  );
}
