import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="relative hidden w-[50%] min-w-[320px] shrink-0 overflow-hidden lg:flex lg:flex-col">
        <Image
          src="/images/image-login.webp"
          alt="Background login image"
          className="absolute inset-0 h-full -scale-x-100 transform object-cover object-left"
          role="presentation"
          width={1200}
          height={1200}
        />

        <div
          className="absolute inset-0 bg-linear-to-r from-background/70 via-background/60 to-background pointer-events-none"
          aria-hidden
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0 items-center justify-center">
        <main className="flex flex-1 overflow-auto">{children}</main>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/terms">
            <span className="text-muted-foreground hover:text-foreground">
              Termos de uso
            </span>
          </Link>
          <span className="mx-2 text-muted-foreground">·</span>
          <Link href="/privacy">
            <span className="text-muted-foreground hover:text-foreground">
              Política de privacidade
            </span>
          </Link>
        </p>

        <footer className="border-t flex justify-center w-[450] border-border py-2">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} © Desenvolvido por{" "}
            {
              <Link href="https://matheusqueiroz.dev.br" target="_blank">
                <span className="font-medium hover:underline hover:text-primary">
                  Matheus Queiroz
                </span>
              </Link>
            }
          </div>
        </footer>
      </div>
    </div>
  );
}
