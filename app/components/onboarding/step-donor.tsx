"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../../i18n/context";
import { useWallet } from "../../lib/wallet/context";
import { FormField } from "../ui/form-field";

type DonorType = "natural" | "juridica";

interface StepDonorProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function StepDonor({ onSuccess, onBack }: StepDonorProps) {
  const { t } = useI18n();
  const { wallet } = useWallet();
  const [donorType, setDonorType] = useState<DonorType>("natural");
  const [fullName, setFullName] = useState("");
  const [dniRuc, setDniRuc] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [legalRep, setLegalRep] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) {
      toast.error(t("error_wallet_required"));
      return;
    }
    if (!fullName.trim()) {
      toast.error(t("error_required_field"));
      return;
    }
    if (donorType === "natural" && dniRuc.length !== 8) {
      toast.error(t("error_invalid_dni"));
      return;
    }
    if (donorType === "juridica" && dniRuc.length !== 11) {
      toast.error(t("error_invalid_ruc"));
      return;
    }

    setLoading(true);
    try {
      // TODO: call register_donor instruction via generated client
      await new Promise((r) => setTimeout(r, 1200)); // simulated tx
      toast.success(t("onboarding_success"));
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(t("error_tx_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Donor type toggle */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">{t("donor_type_title")}</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-low p-1">
          <TypeBtn
            active={donorType === "natural"}
            label={t("donor_natural")}
            onClick={() => setDonorType("natural")}
          />
          <TypeBtn
            active={donorType === "juridica"}
            label={t("donor_juridica")}
            onClick={() => setDonorType("juridica")}
          />
        </div>
      </div>

      <FormField label={t("full_name")} required>
        <input
          className="input-base"
          placeholder={t("full_name_placeholder")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={64}
          required
        />
      </FormField>

      <FormField label={donorType === "natural" ? t("dni") : t("ruc")} required>
        <input
          className="input-base font-mono"
          placeholder={donorType === "natural" ? t("dni_placeholder") : t("ruc_placeholder")}
          value={dniRuc}
          onChange={(e) => setDniRuc(e.target.value.replace(/\D/g, ""))}
          maxLength={donorType === "natural" ? 8 : 11}
          required
        />
      </FormField>

      {donorType === "juridica" && (
        <>
          <FormField label={t("company_name")} required>
            <input
              className="input-base"
              placeholder={t("company_name_placeholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={64}
              required
            />
          </FormField>
          <FormField label={t("legal_rep")}>
            <input
              className="input-base"
              placeholder={t("legal_rep_placeholder")}
              value={legalRep}
              onChange={(e) => setLegalRep(e.target.value)}
              maxLength={64}
            />
          </FormField>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? t("loading") : t("submit")}
        </button>
      </div>
    </form>
  );
}

function TypeBtn({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
        active
          ? "bg-neon-purple text-white shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
