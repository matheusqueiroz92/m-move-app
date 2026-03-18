"use client";

import { WithRole } from "@/components/auth/WithRole";

export default function AIChatPage() {
  return (
    <WithRole roles={["STUDENT", "OWNER", "PERSONAL_TRAINER", "INSTRUCTOR"]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-text-primary">Chat IA</h1>
        <p className="mt-2 text-text-secondary">
          Personal trainer virtual (em breve).
        </p>
      </div>
    </WithRole>
  );
}
