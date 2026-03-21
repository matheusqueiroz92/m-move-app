"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/lib/schemas/auth";
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
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { IconGoogle } from "@/components/ui/icon-google";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const { signUpWithEmail, signInWithSocial } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    const result = await signUpWithEmail(
      values.email,
      values.password,
      values.name,
    );
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Falha ao cadastrar.");
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="space-y-4 px-8 py-6 sm:px-12 sm:py-10">
          <div className="flex flex-col items-center space-y-4 mb-10 text-center">
            <Image
              src="/images/logo-m-move.png"
              alt="M. MOVE"
              width={200}
              height={200}
            />
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Cadastre-se
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Crie sua conta para começar a usar a plataforma.
              </CardDescription>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
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
                    <FormLabel>Senha</FormLabel>
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
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
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login">
              <span className="text-primary hover:underline">Entrar</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
