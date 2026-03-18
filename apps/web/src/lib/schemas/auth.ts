import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
