"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../i18n/context";
import { useWallet } from "../lib/wallet/context";
import { Header } from "../components/header";
import { GridBackground } from "../components/grid-background";
import { WishlistCard } from "../components/wishlist/wishlist-card";
import { FormField } from "../components/ui/form-field";

const MOCK_ORG = {
  orgName: "Albergue Amigos de las Patas",
  ruc: "20601234567",
  status: "Validated",
  totalReceived: 4_500_000_000,
  wishlists: [
    {
      id: "0",
      title: "10 sacos de croquetas para perros",
      description: "Croquetas para 80 perros rescatados.",
      targetAmount: 2_000_000_000,
      raisedAmount: 1_350_000_000,
      donorCount: 14,
      status: "Active" as const,
    },
    {
      id: "1",
      title: "Medicamentos veterinarios — Marzo",
      description: "Antiparasitarios y vacunas.",
      targetAmount: 1_500_000_000,
      raisedAmount: 1_500_000_000,
      donorCount: 22,
      status: "Funded" as const,
    },
  ],
};

export default function DashboardPage() {
  const { t } = useI18n();
  const { wallet, status } = useWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [showInvoice, setShowInvoice] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [invoiceUri, setInvoiceUri] = useState("");
  const [loading, setLoading] = useState(false);

  if (status !== "connected") {
    return (
      <div className="relative min-h-screen bg-background">
        <GridBackground />
        <div className="relative z-10">
          <Header />
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-muted">{t("error_wallet_required")}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLamports = parseFloat(target) * 1e9;
    if (!title || targetLamports <= 0) return;
    setLoading(true);
    try {
      // TODO: call create_wishlist instruction
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Lista de deseos creada");
      setShowCreate(false);
      setTitle(""); setDescription(""); setTarget("");
    } catch {
      toast.error(t("error_tx_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceUri) return;
    setLoading(true);
    try {
      // TODO: call submit_invoice instruction
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Factura enviada al admin para revisión");
      setShowInvoice(null);
      setInvoiceUri("");
    } catch {
      toast.error(t("error_tx_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <GridBackground />
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
          {/* Org header */}
          <div className="card-base flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon text-2xl font-black text-white">
              {MOCK_ORG.orgName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{MOCK_ORG.orgName}</h1>
                <span className="badge-verified">✓ {t("verified_badge")}</span>
              </div>
              <p className="font-mono text-xs text-muted">RUC: {MOCK_ORG.ruc}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-neon">
                {(MOCK_ORG.totalReceived / 1e9).toFixed(2)} SOL
              </p>
              <p className="text-xs text-muted">{t("dashboard_total_received")}</p>
            </div>
          </div>

          {/* Wishlists section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{t("dashboard_wishlists")}</h2>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                + {t("wishlist_create")}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {MOCK_ORG.wishlists.map((wl) => (
                <WishlistCard
                  key={wl.id}
                  {...wl}
                  isOwner
                  onSubmitInvoice={() => setShowInvoice(wl.id)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Create wishlist modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border gradient-border bg-card p-6 shadow-2xl purple-glow">
            <h3 className="font-bold text-foreground">{t("wishlist_create_title")}</h3>
            <form onSubmit={handleCreateWishlist} className="mt-5 space-y-4">
              <FormField label={t("wishlist_item_title")} required>
                <input className="input-base" placeholder={t("wishlist_item_title_placeholder")} value={title} onChange={(e) => setTitle(e.target.value)} required />
              </FormField>
              <FormField label={t("wishlist_description")}>
                <textarea className="input-base min-h-[80px] resize-none" placeholder={t("wishlist_description_placeholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormField>
              <FormField label={t("wishlist_target")} required>
                <input className="input-base font-mono" placeholder={t("wishlist_target_placeholder")} value={target} onChange={(e) => setTarget(e.target.value)} type="number" step="0.001" min="0.001" required />
              </FormField>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">{t("cancel")}</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? t("loading") : t("wishlist_create")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit invoice modal */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvoice(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border gradient-border bg-card p-6 shadow-2xl">
            <h3 className="font-bold text-foreground">{t("wishlist_submit_invoice")}</h3>
            <p className="mt-1 text-xs text-muted">Sube la URL de tu factura/boleta (IPFS/Arweave) como prueba de compra.</p>
            <form onSubmit={handleSubmitInvoice} className="mt-5 space-y-4">
              <FormField label={t("wishlist_invoice_uri")} required>
                <input className="input-base" placeholder={t("wishlist_invoice_placeholder")} value={invoiceUri} onChange={(e) => setInvoiceUri(e.target.value)} type="url" required />
              </FormField>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInvoice(null)} className="btn-secondary flex-1">{t("cancel")}</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? t("loading") : t("submit")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
