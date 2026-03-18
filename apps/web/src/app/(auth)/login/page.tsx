import { PageSuspense } from "@/components/layout/PageSuspense";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <PageSuspense fallbackLabel="Carregando...">
      <LoginForm />
    </PageSuspense>
  );
}
