"use client";

import { useI18n } from "../../i18n/context";
import type { Role } from "./onboarding-modal";

interface StepSuccessProps {
  role: Role;
  onContinue: () => void;
}

export function StepSuccess({ role, onContinue }: StepSuccessProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      {/* Animated checkmark */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-neon/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground">{t("onboarding_success")}</h3>
        <p className="mt-1 text-sm text-muted">{t("onboarding_success_desc")}</p>
      </div>

      {role === "org" && (
        <div className="w-full rounded-lg border border-neon-purple/30 bg-neon-purple/5 px-4 py-3 text-left">
          <p className="text-xs text-muted">{t("org_pending_notice")}</p>
        </div>
      )}

      <button onClick={onContinue} className="btn-primary w-full">
        {role === "org" ? "Ir al Dashboard" : "Explorar ONGs"}
      </button>
    </div>
  );
}
