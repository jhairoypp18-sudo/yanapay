"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../../i18n/context";
import { useWallet } from "../../lib/wallet/context";
import { FormField } from "../ui/form-field";

interface StepOrgProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function StepOrg({ onSuccess, onBack }: StepOrgProps) {
  const { t } = useI18n();
  const { wallet } = useWallet();
  const [orgName, setOrgName] = useState("");
  const [ruc, setRuc] = useState("");
  const [description, setDescription] = useState("");
  const [logoUri, setLogoUri] = useState("");
  const [bannerUri, setBannerUri] = useState("");
  const [web, setWeb] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) {
      toast.error(t("error_wallet_required"));
      return;
    }
    if (!orgName.trim()) {
      toast.error(t("error_required_field"));
      return;
    }
    if (ruc.length !== 11) {
      toast.error(t("error_invalid_ruc"));
      return;
    }

    const socialMedia = JSON.stringify({ web, ig: instagram, fb: facebook });

    setLoading(true);
    try {
      // TODO: call register_org instruction via generated client
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <FormField label={t("org_name")} required>
        <input
          className="input-base"
          placeholder={t("org_name_placeholder")}
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          maxLength={64}
          required
        />
      </FormField>

      <FormField label={t("ruc")} required>
        <input
          className="input-base font-mono"
          placeholder={t("ruc_placeholder")}
          value={ruc}
          onChange={(e) => setRuc(e.target.value.replace(/\D/g, ""))}
          maxLength={11}
          required
        />
      </FormField>

      <FormField label={t("org_description")}>
        <textarea
          className="input-base min-h-[80px] resize-none"
          placeholder={t("org_description_placeholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={256}
        />
      </FormField>

      <FormField label={t("org_logo")}>
        <input
          className="input-base"
          placeholder={t("org_logo_placeholder")}
          value={logoUri}
          onChange={(e) => setLogoUri(e.target.value)}
          type="url"
        />
      </FormField>

      <FormField label={t("org_banner")}>
        <input
          className="input-base"
          placeholder={t("org_banner_placeholder")}
          value={bannerUri}
          onChange={(e) => setBannerUri(e.target.value)}
          type="url"
        />
      </FormField>

      {/* Social media */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">{t("social_media")}</p>
        <div className="space-y-2">
          <SocialInput icon="🌐" label={t("social_web")} value={web} onChange={setWeb} />
          <SocialInput icon="📸" label="Instagram" value={instagram} onChange={setInstagram} />
          <SocialInput icon="📘" label="Facebook" value={facebook} onChange={setFacebook} />
        </div>
      </div>

      {/* Proof upload notice */}
      <div className="rounded-lg border border-neon-purple/30 bg-neon-purple/5 px-4 py-3">
        <p className="text-xs font-medium text-neon-purple">{t("org_proof")}</p>
        <p className="mt-1 text-xs text-muted">{t("org_proof_desc")}</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          {t("back")}
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? t("loading") : t("submit")}
        </button>
      </div>
    </form>
  );
}

function SocialInput({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-center text-sm">{icon}</span>
      <input
        className="input-base flex-1 text-sm"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
