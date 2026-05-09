"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useWallet } from "../lib/wallet/context";
import { useCluster } from "../components/cluster-context";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { getTransferSolInstruction } from "../lib/system-transfer";
import { Header } from "../components/header";
import { GridBackground } from "../components/grid-background";
import { OrgCard, OrgCardSkeleton } from "../components/org/org-card";
import { WishlistCard } from "../components/wishlist/wishlist-card";
import { DonateModal } from "../components/wishlist/donate-modal";

const MOCK_NGO_WALLET = "5mbmctgAQYRkJFZ8TsGbTKKrWML2xFbnPpSb6t1JtMMJ";

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
    wishlistCount: 2,
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
    wishlistCount: 3,
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
      {
        id: "1",
        title: "Loncheras nutritivas — Abril",
        description: "Alimentos balanceados para 50 niños durante todo el mes de abril.",
        targetAmount: 1_200_000_000,
        raisedAmount: 450_000_000,
        donorCount: 11,
        status: "Active" as const,
      },
      {
        id: "2",
        title: "Tablets educativas — Aula digital",
        description: "10 tablets para el aula de cómputo del colegio María Parado de Bellido.",
        targetAmount: 3_000_000_000,
        raisedAmount: 3_000_000_000,
        donorCount: 38,
        status: "Funded" as const,
        invoiceUri: "https://ipfs.io/example-invoice-2",
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
    validated: true,
    totalReceived: 6_800_000_000,
    wishlistCount: 2,
    wishlists: [
      {
        id: "0",
        title: "Filtros de agua — Comunidad Huancavelica",
        description: "50 filtros de agua potable para familias en la comunidad de Acobambilla.",
        targetAmount: 2_500_000_000,
        raisedAmount: 900_000_000,
        donorCount: 17,
        status: "Active" as const,
      },
      {
        id: "1",
        title: "Instalación de biodigestores",
        description: "Saneamiento básico para 20 familias en zona rural de Ayacucho.",
        targetAmount: 4_000_000_000,
        raisedAmount: 4_000_000_000,
        donorCount: 29,
        status: "Funded" as const,
        invoiceUri: "https://ipfs.io/example-invoice-3",
      },
    ],
  },
  {
    id: "4",
    walletAddress: MOCK_NGO_WALLET,
    orgName: "Mujeres Emprendedoras del Sur",
    ruc: "20531298765",
    description: "Capacitación y microcréditos para mujeres emprendedoras en Arequipa y Puno.",
    logoUri: "",
    validated: true,
    totalReceived: 9_200_000_000,
    wishlistCount: 2,
    wishlists: [
      {
        id: "0",
        title: "Talleres de costura industrial — Juliaca",
        description: "Máquinas de coser y materiales para capacitar a 30 mujeres en Juliaca.",
        targetAmount: 1_800_000_000,
        raisedAmount: 720_000_000,
        donorCount: 19,
        status: "Active" as const,
      },
      {
        id: "1",
        title: "Fondo rotativo de microcréditos",
        description: "Capital semilla para 15 emprendimientos liderados por mujeres en Arequipa.",
        targetAmount: 5_000_000_000,
        raisedAmount: 2_100_000_000,
        donorCount: 34,
        status: "Active" as const,
      },
    ],
  },
  {
    id: "5",
    walletAddress: MOCK_NGO_WALLET,
    orgName: "Reforesta Amazonía",
    ruc: "20489123456",
    description: "Reforestación y protección de bosques nativos en la Amazonía peruana.",
    logoUri: "",
    validated: true,
    totalReceived: 3_100_000_000,
    wishlistCount: 1,
    wishlists: [
      {
        id: "0",
        title: "Plantones nativos — Cuenca del Ucayali",
        description: "10,000 plantones de especies nativas para reforestar 50 hectáreas degradadas.",
        targetAmount: 3_500_000_000,
        raisedAmount: 1_240_000_000,
        donorCount: 26,
        status: "Active" as const,
      },
    ],
  },
  {
    id: "6",
    walletAddress: MOCK_NGO_WALLET,
    orgName: "Centro Cultural Quechua Vivo",
    ruc: "20567891234",
    description: "Preservación de la lengua y cultura quechua a través de talleres y materiales digitales.",
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

export default function MarketplacePage() {
  const { signer } = useWallet();
  const { getExplorerUrl } = useCluster();
  const { send } = useSendTransaction();
  const [search, setSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<(typeof MOCK_ORGS)[0] | null>(null);
  const [donateTarget, setDonateTarget] = useState<SelectedWishlist>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrgs = MOCK_ORGS.filter(
    (o) =>
      o.validated &&
      (search === "" ||
        o.orgName.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase()))
  );

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
          {selectedOrg ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedOrg(null)}
                className="btn-ghost flex items-center gap-2"
              >
                ← Volver a organizaciones
              </button>

              <div className="card-base flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon text-2xl font-black text-white">
                  {selectedOrg.orgName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{selectedOrg.orgName}</h2>
                    {selectedOrg.validated && (
                      <span className="badge-verified">✓ Verificada</span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted">RUC: {selectedOrg.ruc}</p>
                  <p className="mt-2 text-sm text-muted">{selectedOrg.description}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">Listas de deseos activas</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedOrg.wishlists.map((wl) => (
                    <WishlistCard
                      key={wl.id}
                      {...wl}
                      onDonate={() => setDonateTarget({ org: selectedOrg, wishlist: wl })}
                    />
                  ))}
                  {selectedOrg.wishlists.length === 0 && (
                    <p className="col-span-2 py-8 text-center text-sm text-muted">
                      Esta organización aún no tiene listas activas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-foreground">Organizaciones</h1>
                  <p className="text-sm text-muted">ONGs verificadas en Solana devnet</p>
                </div>
                <input
                  className="input-base w-64"
                  placeholder="Buscar organización..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <OrgCardSkeleton key={i} />)
                  : filteredOrgs.map((org) => (
                      <OrgCard
                        key={org.id}
                        {...org}
                        onSelect={() => setSelectedOrg(org)}
                      />
                    ))}
              </div>

              {!loading && filteredOrgs.length === 0 && (
                <p className="py-16 text-center text-muted">No se encontraron organizaciones.</p>
              )}
            </section>
          )}
        </main>
      </div>

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
