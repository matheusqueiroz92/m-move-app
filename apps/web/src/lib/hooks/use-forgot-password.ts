"use client";

import { useMutation } from "@tanstack/react-query";
import { forgetPassword } from "@/lib/api/auth";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgetPassword(email),
  });
}
