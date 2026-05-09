"use client";

import { useI18n } from "../../i18n/context";

interface OrgCardProps {
  orgName: string;
  description: string;
  logoUri?: string;
  ruc: string;
  validated: boolean;
  totalReceived: number;
  wishlistCount: number;
  onSelect: () => void;
}

export function OrgCard({
  orgName,
  description,
  logoUri,
  ruc,
  validated,
  totalReceived,
  wishlistCount,
  onSelect,
}: OrgCardProps) {
  const { t } = useI18n();
  const solReceived = (totalReceived / 1e9).toFixed(2);

  return (
    <button
      onClick={onSelect}
      className="card-hover group w-full cursor-pointer text-left"
    >
      {/* Banner area */}
      <div className="relative -mx-5 -mt-5 mb-4 h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-neon-purple/20 to-neon/10">
        {logoUri ? (
          <img src={logoUri} alt={orgName} className="h-full w-full object-cover opacity-60" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl opacity-20">🏢</div>
        )}
        {/* Logo */}
        <div className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-card bg-gradient-to-br from-neon-purple to-neon text-xl shadow-lg">
          {orgName.charAt(0).toUpperCase()}
        </div>
        {/* Badge */}
        <div className="absolute right-3 top-3">
          {validated ? (
            <span className="badge-verified">✓ {t("verified_badge")}</span>
          ) : (
            <span className="badge-pending">⏳ {t("pending_badge")}</span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-foreground group-hover:text-neon-purple transition-colors">
          {orgName}
        </h3>
        <p className="mt-1 font-mono text-xs text-muted">RUC: {ruc}</p>
        {description && (
          <p className="mt-2 line-clamp-2 text-xs text-muted">{description}</p>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between border-t border-border-low pt-3 text-xs text-muted">
          <span>
            <span className="font-semibold text-neon">{solReceived} SOL</span> recibidos
          </span>
          <span>
            <span className="font-semibold text-foreground">{wishlistCount}</span> listas
          </span>
        </div>
      </div>
    </button>
  );
}

export function OrgCardSkeleton() {
  return (
    <div className="card-base space-y-4">
      <div className="skeleton h-24 -mx-5 -mt-5 rounded-t-2xl rounded-b-none" />
      <div className="skeleton mt-6 h-5 w-2/3" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-8 w-full" />
      <div className="flex gap-4">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}
