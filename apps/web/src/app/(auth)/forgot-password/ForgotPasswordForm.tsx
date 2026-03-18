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
    <div className="flex w-full flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl text-primary">M. Move</CardTitle>
          <CardDescription className="text-foreground">
            Recuperar senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Link href="/login" className="text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
