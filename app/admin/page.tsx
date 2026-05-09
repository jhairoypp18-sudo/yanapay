"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../i18n/context";
import { Header } from "../components/header";
import { GridBackground } from "../components/grid-background";

const ADMIN_WALLET = "CZPoBbvq8VK8kaY915RFgTsdH5XTkhxFbC8dVbkUsgWj";

const MOCK_PENDING_ORGS = [
  {
    id: "3",
    orgName: "ONG Agua Limpia Perú",
    ruc: "20412345678",
    description: "Acceso a agua potable en comunidades rurales andinas.",
    wallet: "9Gg3QFk...",
    registeredAt: "2026-05-08",
  },
];

const MOCK_PENDING_INVOICES = [
  {
    id: "wl-1",
    orgName: "Albergue Amigos de las Patas",
    wishlistTitle: "Medicamentos veterinarios — Marzo",
    invoiceUri: "https://ipfs.io/ipfs/QmExampleHash123",
    amount: "1.500 SOL",
    fundedAt: "2026-05-07",
  },
];

export default function AdminPage() {
  const { t } = useI18n();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleValidate = async (orgId: string) => {
    setLoadingId(orgId);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Organización validada correctamente");
    } catch {
      toast.error(t("error_tx_failed"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (orgId: string) => {
    setLoadingId(orgId);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Organización rechazada");
    } catch {
      toast.error(t("error_tx_failed"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleRelease = async (invoiceId: string) => {
    setLoadingId(invoiceId);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Fondos liberados correctamente ✓");
    } catch {
      toast.error(t("error_tx_failed"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectInvoice = async (invoiceId: string) => {
    setLoadingId(invoiceId);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Factura rechazada. La ONG deberá reenviar.");
    } catch {
      toast.error(t("error_tx_failed"));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <GridBackground />
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
          {/* Admin header */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-neon-purple text-xl">
              🛡️
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">{t("admin_title")}</h1>
              <p className="font-mono text-xs text-muted">
                Admin: {ADMIN_WALLET.slice(0, 8)}...{ADMIN_WALLET.slice(-6)}
              </p>
            </div>
          </div>

          {/* Global stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "ONGs verificadas", value: "2", color: "text-neon" },
              { label: "ONGs pendientes", value: "1", color: "text-yellow-400" },
              { label: "SOL total donado", value: "16.5", color: "text-neon-purple" },
              { label: "Facturas pendientes", value: "1", color: "text-orange-400" },
            ].map((s) => (
              <div key={s.label} className="card-base text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending orgs */}
          <section className="space-y-4">
            <h2 className="font-semibold text-foreground">
              {t("admin_orgs_pending")}
              <span className="ml-2 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
                {MOCK_PENDING_ORGS.length}
              </span>
            </h2>
            {MOCK_PENDING_ORGS.length === 0 ? (
              <p className="text-sm text-muted">No hay organizaciones pendientes.</p>
            ) : (
              <div className="space-y-3">
                {MOCK_PENDING_ORGS.map((org) => (
                  <div key={org.id} className="card-base flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple/40 to-neon/40 font-bold text-foreground">
                      {org.orgName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{org.orgName}</p>
                      <p className="font-mono text-xs text-muted">RUC: {org.ruc}</p>
                      <p className="mt-1 text-xs text-muted">{org.description}</p>
                      <p className="mt-1 text-xs text-muted/60">Registrado: {org.registeredAt}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleValidate(org.id)}
                        disabled={loadingId === org.id}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        {loadingId === org.id ? "..." : `✓ ${t("admin_validate")}`}
                      </button>
                      <button
                        onClick={() => handleReject(org.id)}
                        disabled={loadingId === org.id}
                        className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                      >
                        {t("admin_reject")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending invoices (HOTL release) */}
          <section className="space-y-4">
            <h2 className="font-semibold text-foreground">
              {t("admin_invoices")}
              <span className="ml-2 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                {MOCK_PENDING_INVOICES.length}
              </span>
            </h2>
            {MOCK_PENDING_INVOICES.length === 0 ? (
              <p className="text-sm text-muted">No hay facturas pendientes de revisión.</p>
            ) : (
              <div className="space-y-3">
                {MOCK_PENDING_INVOICES.map((inv) => (
                  <div key={inv.id} className="card-base space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{inv.orgName}</p>
                        <p className="text-xs text-muted">{inv.wishlistTitle}</p>
                        <p className="mt-1 text-xs text-muted/60">Meta alcanzada: {inv.fundedAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-neon">{inv.amount}</p>
                        <p className="text-xs text-muted">en escrow</p>
                      </div>
                    </div>

                    {/* Invoice preview */}
                    <div className="rounded-lg border border-border-low bg-accent/30 px-3 py-2">
                      <p className="text-xs text-muted">Factura/Boleta:</p>
                      <a
                        href={inv.invoiceUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-xs text-neon-purple underline underline-offset-2"
                      >
                        {inv.invoiceUri}
                      </a>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRelease(inv.id)}
                        disabled={loadingId === inv.id}
                        className="btn-primary flex-1"
                      >
                        {loadingId === inv.id ? t("loading") : `✓ ${t("admin_release")}`}
                      </button>
                      <button
                        onClick={() => handleRejectInvoice(inv.id)}
                        disabled={loadingId === inv.id}
                        className="flex-1 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                      >
                        {t("admin_reject_invoice")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
