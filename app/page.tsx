"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useWallet } from "./lib/wallet/context";
import { useI18n } from "./i18n/context";
import { useCluster } from "./components/cluster-context";
import { useSendTransaction } from "./lib/hooks/use-send-transaction";
import { getTransferSolInstruction } from "./lib/system-transfer";
import { Header } from "./components/header";
import { GridBackground } from "./components/grid-background";
import { OnboardingModal } from "./components/onboarding/onboarding-modal";
import { OrgCard, OrgCardSkeleton } from "./components/org/org-card";
import { WishlistCard, WishlistCardSkeleton } from "./components/wishlist/wishlist-card";
import { DonateModal } from "./components/wishlist/donate-modal";

const MOCK_NGO_WALLET = "5mbmctgAQYRkJFZ8TsGbTKKrWML2xFbnPpSb6t1JtMMJ";

// Mock data for hackathon demo
const MOCK_ORGS = [
  {
    id: "1",
    walletAddress: MOCK_NGO_WALLET,
    orgName: "Albergue Amigos de las Patas",
    ruc: "20601234567",
    description: "Albergue de animales en Lima con más de 200 perros y gatos rescatados.",
    logoUri: "",
    validated: true,
    totalReceived: 4_500_000_000,
    wishlistCount: 3,
    wishlists: [
      {
        id: "0",
        title: "10 sacos de croquetas para perros",
        description: "Necesitamos croquetas para alimentar a nuestros 80 perros rescatados este mes.",
        targetAmount: 2_000_000_000,
        raisedAmount: 1_350_000_000,
        donorCount: 14,
        status: "Active" as const,
      },
      {
        id: "1",
        title: "Medicamentos veterinarios — Marzo",
        description: "Antiparasitarios y vacunas anuales para todos los animales.",
        targetAmount: 1_500_000_000,
        raisedAmount: 1_500_000_000,
        donorCount: 22,
        status: "Funded" as const,
        invoiceUri: "https://ipfs.io/example-invoice",
      },
    ],
  },
  {
    id: "2",
    walletAddress: MOCK_NGO_WALLET,
    orgName: "Fundación Niños del Mañana",
    ruc: "20509876543",
    description: "Educación y nutrición para niños en zonas vulnerables de Lima Sur.",
    logoUri: "",
    validated: true,
    totalReceived: 12_000_000_000,
    wishlistCount: 5,
    wishlists: [
      {
        id: "0",
        title: "Útiles escolares — 50 niños",
        description: "Cuadernos, lápices y colores para el inicio del año escolar 2026.",
        targetAmount: 800_000_000,
        raisedAmount: 320_000_000,
        donorCount: 8,
        status: "Active" as const,
      },
    ],
  },
  {
    id: "3",
    walletAddress: MOCK_NGO_WALLET,
    orgName: "ONG Agua Limpia Perú",
    ruc: "20412345678",
    description: "Acceso a agua potable y saneamiento en comunidades rurales andinas.",
    logoUri: "",
    validated: false,
    totalReceived: 0,
    wishlistCount: 0,
    wishlists: [],
  },
];

type SelectedWishlist = {
  org: (typeof MOCK_ORGS)[0];
  wishlist: (typeof MOCK_ORGS)[0]["wishlists"][0];
} | null;

export default function Home() {
  const { wallet, status, signer } = useWallet();
  const { t } = useI18n();
  const { getExplorerUrl } = useCluster();
  const { send } = useSendTransaction();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<(typeof MOCK_ORGS)[0] | null>(null);
  const [donateTarget, setDonateTarget] = useState<SelectedWishlist>(null);
  const [loading, setLoading] = useState(true);

  // Show onboarding when wallet connects for first time
  useEffect(() => {
    if (status === "connected" && wallet) {
      const registered = localStorage.getItem(`yanapay_registered_${wallet.account.address}`);
      if (!registered) setShowOnboarding(true);
    }
  }, [status, wallet]);

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredOrgs = MOCK_ORGS.filter(
    (o) =>
      o.validated &&
      (search === "" ||
        o.orgName.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOnboardingComplete = () => {
    if (wallet) {
      localStorage.setItem(`yanapay_registered_${wallet.account.address}`, "1");
    }
    setShowOnboarding(false);
  };

  const handleDonate = async (amountSol: number) => {
    if (!signer || !donateTarget) throw new Error("Wallet no conectada");
    const lamports = BigInt(Math.round(amountSol * 1e9));
    const ix = getTransferSolInstruction(
      signer.address as string,
      donateTarget.org.walletAddress,
      lamports
    );
    const sig = await send({ instructions: [ix] });
    toast.success(`✓ ${amountSol} SOL enviado a ${donateTarget.org.orgName}`, {
      description: (
        <a
          href={getExplorerUrl(`/tx/${sig}`)}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Ver en Explorer →
        </a>
      ),
      duration: 8000,
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />
      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* Hero */}
          {!selectedOrg && (
            <section className="mb-12">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/5 px-4 py-1.5 text-xs font-medium text-neon-purple">
                  ✦ Dev3Pack 2026 Hackathon
                </div>
                <h1 className="text-5xl font-black tracking-tight text-foreground md:text-6xl">
                  yana
                  <span className="bg-gradient-to-r from-neon-purple to-neon bg-clip-text text-transparent">
                    /pay
                  </span>
                </h1>
                <p className="mt-4 text-lg text-muted">{t("app_tagline")}</p>

                {status !== "connected" && (
                  <p className="mt-6 text-sm text-muted/70">
                    Conecta tu wallet para donar o registrar tu organización
                  </p>
                )}
              </div>

              {/* Stats bar */}
              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl border border-border-low bg-card p-5">
                {[
                  { label: "ONGs verificadas", value: "2" },
                  { label: "Total recaudado", value: "16.5 SOL" },
                  { label: "Donaciones", value: "44" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                    <p className="text-xs text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Org detail view */}
          {selectedOrg ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedOrg(null)}
                className="btn-ghost flex items-center gap-2"
              >
                ← Volver a organizaciones
              </button>

              {/* Org header */}
              <div className="card-base flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon text-2xl font-black text-white">
                  {selectedOrg.orgName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{selectedOrg.orgName}</h2>
                    {selectedOrg.validated && (
                      <span className="badge-verified">✓ {t("verified_badge")}</span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted">RUC: {selectedOrg.ruc}</p>
                  <p className="mt-2 text-sm text-muted">{selectedOrg.description}</p>
                </div>
              </div>

              {/* Wishlists */}
              <div>
                <h3 className="mb-4 font-semibold text-foreground">{t("wishlist_title")}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedOrg.wishlists.map((wl) => (
                    <WishlistCard
                      key={wl.id}
                      {...wl}
                      onDonate={() =>
                        setDonateTarget({ org: selectedOrg, wishlist: wl })
                      }
                    />
                  ))}
                  {selectedOrg.wishlists.length === 0 && (
                    <p className="col-span-2 text-center text-sm text-muted py-8">
                      Esta organización aún no tiene listas activas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Marketplace grid */
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground">{t("marketplace_title")}</h2>
                <input
                  className="input-base w-64"
                  placeholder={t("marketplace_search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <OrgCardSkeleton key={i} />)
                  : filteredOrgs.map((org) => (
                      <OrgCard
                        key={org.id}
                        {...org}
                        onSelect={() => setSelectedOrg(org)}
                      />
                    ))}
              </div>

              {!loading && filteredOrgs.length === 0 && (
                <p className="py-16 text-center text-muted">{t("marketplace_empty")}</p>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Donate modal */}
      {donateTarget && (
        <DonateModal
          wishlistTitle={donateTarget.wishlist.title}
          targetSol={donateTarget.wishlist.targetAmount / 1e9}
          raisedSol={donateTarget.wishlist.raisedAmount / 1e9}
          onDonate={handleDonate}
          onClose={() => setDonateTarget(null)}
        />
      )}
    </div>
  );
}
