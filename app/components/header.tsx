"use client";

import Link from "next/link";
import { useI18n } from "../i18n/context";
import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";
import { ClusterSelect } from "./cluster-select";

export function Header() {
  const { locale, setLocale } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-low bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon text-white text-sm font-black">
            Y
          </div>
          <span className="font-black tracking-tight text-foreground">
            yana<span className="text-neon-purple">/</span>pay
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <Link href="/" className="transition hover:text-foreground">
            Inicio
          </Link>
          <Link href="/marketplace" className="transition hover:text-foreground">
            Organizaciones
          </Link>
          <Link href="/dashboard" className="transition hover:text-foreground">
            Mi ONG
          </Link>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="rounded-lg border border-border-low px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-neon-purple hover:text-foreground"
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
          <ThemeToggle />
          <ClusterSelect />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
