"use client";

import { useI18n } from "../../i18n/context";

export type WishlistStatus = "Active" | "Funded" | "Completed" | "Cancelled";

interface WishlistCardProps {
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  status: WishlistStatus;
  invoiceUri?: string;
  onDonate?: () => void;
  onSubmitInvoice?: () => void;
  isOwner?: boolean;
}

export function WishlistCard({
  title,
  description,
  targetAmount,
  raisedAmount,
  donorCount,
  status,
  invoiceUri,
  onDonate,
  onSubmitInvoice,
  isOwner,
}: WishlistCardProps) {
  const { t } = useI18n();
  const sol = (l: number) => (l / 1e9).toFixed(3);
  const pct = Math.min(100, Math.round((raisedAmount / targetAmount) * 100));

  const statusLabel: Record<WishlistStatus, string> = {
    Active: t("wishlist_status_active"),
    Funded: t("wishlist_status_funded"),
    Completed: t("wishlist_status_completed"),
    Cancelled: t("wishlist_status_cancelled"),
  };

  const statusColor: Record<WishlistStatus, string> = {
    Active: "text-neon bg-neon/10",
    Funded: "text-neon-purple bg-neon-purple/10",
    Completed: "text-blue-400 bg-blue-400/10",
    Cancelled: "text-muted bg-accent",
  };

  return (
    <div className="card-base space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{title}</h4>
          {description && (
            <p className="mt-0.5 text-xs text-muted line-clamp-2">{description}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            <span className="font-semibold text-neon">{sol(raisedAmount)} SOL</span>{" "}
            {t("wishlist_raised")}
          </span>
          <span>
            <span className="font-semibold text-foreground">{sol(targetAmount)} SOL</span>{" "}
            {t("wishlist_goal")}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{pct}% completo</span>
          <span>{donorCount} {t("wishlist_donors")}</span>
        </div>
      </div>

      {/* Actions */}
      {status === "Active" && !isOwner && onDonate && (
        <button onClick={onDonate} className="btn-primary w-full">
          {t("wishlist_donate")}
        </button>
      )}

      {status === "Funded" && isOwner && !invoiceUri && onSubmitInvoice && (
        <button onClick={onSubmitInvoice} className="btn-primary w-full">
          {t("wishlist_submit_invoice")}
        </button>
      )}

      {invoiceUri && (
        <a
          href={invoiceUri}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-neon-purple underline underline-offset-2"
        >
          📄 Ver factura/boleta
        </a>
      )}
    </div>
  );
}

export function WishlistCardSkeleton() {
  return (
    <div className="card-base space-y-4">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="skeleton h-9 w-full rounded-lg" />
    </div>
  );
}
