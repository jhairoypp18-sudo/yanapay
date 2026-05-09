"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../../i18n/context";
import { FormField } from "../ui/form-field";

interface DonateModalProps {
  wishlistTitle: string;
  targetSol: number;
  raisedSol: number;
  onDonate: (amountSol: number) => Promise<void>;
  onClose: () => void;
}

const PRESETS = [0.1, 0.5, 1, 2];

export function DonateModal({
  wishlistTitle,
  targetSol,
  raisedSol,
  onDonate,
  onClose,
}: DonateModalProps) {
  const { t } = useI18n();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const remaining = targetSol - raisedSol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sol = parseFloat(amount);
    if (!sol || sol <= 0) {
      toast.error(t("error_invalid_amount"));
      return;
    }
    if (sol > remaining) {
      toast.error(`Máximo: ${remaining.toFixed(3)} SOL`);
      return;
    }
    setLoading(true);
    try {
      await onDonate(sol);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("error_tx_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border gradient-border bg-card p-6 shadow-2xl purple-glow">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:text-foreground transition"
        >
          ✕
        </button>

        <h3 className="font-bold text-foreground">{t("wishlist_donate")}</h3>
        <p className="mt-1 text-xs text-muted line-clamp-1">{wishlistTitle}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Preset amounts */}
          <div>
            <p className="mb-2 text-xs text-muted">Montos rápidos</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  disabled={p > remaining}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    amount === String(p)
                      ? "border-neon-purple bg-neon-purple/10 text-neon-purple"
                      : "border-border-low text-muted hover:border-neon-purple/50"
                  } disabled:opacity-30`}
                >
                  {p} SOL
                </button>
              ))}
            </div>
          </div>

          <FormField label={t("donate_amount")} required>
            <input
              className="input-base font-mono"
              placeholder={t("donate_amount_placeholder")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.001"
              min="0.001"
              max={remaining}
              required
            />
          </FormField>

          <div className="rounded-lg bg-accent/50 px-3 py-2 text-xs text-muted">
            Restante para la meta:{" "}
            <span className="font-semibold text-foreground">{remaining.toFixed(3)} SOL</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t("loading") : `${t("donate_confirm")} → ${amount || "0"} SOL`}
          </button>
        </form>
      </div>
    </div>
  );
}
