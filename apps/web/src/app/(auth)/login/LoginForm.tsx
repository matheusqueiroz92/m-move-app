"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { loginFormSchema, type LoginFormValues } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { IconGoogle } from "@/components/ui/icon-google";
// import { IconGithub } from "@/components/ui/icon-github";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, signInWithSocial } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    const result = await signInWithEmail(values.email, values.password);
    if (result.ok) {
      router.push(redirect);
    } else {
      setError(result.error ?? "Falha ao entrar.");
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="space-y-4 px-8 py-6 sm:px-12 sm:py-8">
          <div className="flex flex-col items-center space-y-4 mb-8 text-center">
            <Image
              src="/images/logo-m-move.png"
              alt="M. MOVE"
              width={200}
              height={200}
            />
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Entre para continuar
              </CardDescription>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <p
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          autoComplete="email"
                          className="pl-9 placeholder:text-muted-foreground"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="pl-9 pr-9 placeholder:text-muted-foreground"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember">Lembrar-me</Label>
                </div>
                <Link href="/forgot-password">
                  <span className="text-xs font-medium text-primary hover:underline">
                    Esqueceu a senha?
                  </span>
                </Link>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-semibold cursor-pointer hover:scale-102 transition-all duration-300 shadow-primary mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-card px-3 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-border bg-background/80 text-base font-medium hover:bg-muted cursor-pointer"
              onClick={() => signInWithSocial("google")}
            >
              <IconGoogle />
              Continuar com Google
            </Button>

            {/* <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-border bg-background/80 text-base font-medium hover:bg-muted cursor-pointer"
              onClick={() => signInWithSocial("github")}
            >
              <IconGithub />
              Continuar com GitHub
            </Button> */}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/register">
              <span className="text-primary hover:underline">Cadastre-se</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
