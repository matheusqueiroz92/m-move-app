"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { Input } from "@/components/ui/input";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/lib/schemas/auth";
import { useForgotPassword } from "@/lib/hooks/use-forgot-password";
import Image from "next/image";

export default function ForgotPasswordForm() {
  const {
    mutateAsync: submitForgotPassword,
    isPending,
    isSuccess,
    data,
    isError,
    error,
  } = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    await submitForgotPassword(values.email);
  }

  const sent = isSuccess && data?.ok;
  const errorMessage =
    isError && error
      ? error instanceof Error
        ? error.message
        : "Erro de conexão. Tente novamente."
      : isSuccess && data && !data.ok
        ? data.message
        : null;

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
                Recuperar senha
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Digite seu e-mail para receber um link de recuperação de senha.
              </CardDescription>
            </div>
          </div>
          {sent ? (
            <p className="text-center text-sm text-muted-foreground">
              Se existir uma conta com esse email, você receberá um link para
              redefinir a senha.
            </p>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {errorMessage && (
                  <p className="text-sm text-destructive" role="alert">
                    {errorMessage}
                  </p>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar link"
                  )}
                </Button>
              </form>
            </Form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/register">
              <span className="text-primary hover:underline">
                Voltar ao login
              </span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
