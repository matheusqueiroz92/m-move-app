"use client";

import { useMutation } from "@tanstack/react-query";
import { acceptPtInvite } from "@/lib/api/pt-invites";
import { acceptGymInvite } from "@/lib/api/gym";

export type AcceptInviteResult =
  | { ok: true; source: "pt" | "gym" }
  | { ok: false; error: string };

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (token: string): Promise<AcceptInviteResult> => {
      try {
        await acceptPtInvite(token);
        return { ok: true, source: "pt" };
      } catch {
        try {
          await acceptGymInvite(token);
          return { ok: true, source: "gym" };
        } catch {
          return { ok: false, error: "Convite inválido ou expirado." };
        }
      }
    },
  });
}
