"use client";

import { useState } from "react";
import { useI18n } from "../../i18n/context";
import { StepRole } from "./step-role";
import { StepDonor } from "./step-donor";
import { StepOrg } from "./step-org";
import { StepSuccess } from "./step-success";

export type Role = "donor" | "org" | null;
export type Step = "role" | "form" | "success";

export interface OnboardingState {
  role: Role;
  step: Step;
}

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { t } = useI18n();
  const [state, setState] = useState<OnboardingState>({
    role: null,
    step: "role",
  });

  const handleRoleSelect = (role: Role) => {
    setState({ role, step: "form" });
  };

  const handleSuccess = () => {
    setState((s) => ({ ...s, step: "success" }));
  };

  const handleBack = () => {
    setState({ role: null, step: "role" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border gradient-border bg-card shadow-2xl purple-glow">
        {/* Header */}
        <div className="border-b border-border-low px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon">
              <span className="text-sm font-black text-white">Y</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground">{t("onboarding_title")}</h2>
              <p className="text-xs text-muted">{t("onboarding_subtitle")}</p>
            </div>
          </div>

          {/* Step indicator */}
          {state.step !== "success" && (
            <div className="mt-4 flex items-center gap-2">
              <StepDot
                active={state.step === "role"}
                done={state.step === "form"}
                label={t("onboarding_step1")}
              />
              <div className="h-px flex-1 bg-border" />
              <StepDot
                active={state.step === "form"}
                done={false}
                label={t("onboarding_step2")}
              />
              <div className="h-px flex-1 bg-border" />
              <StepDot active={false} done={false} label={t("onboarding_step3")} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {state.step === "role" && (
            <StepRole onSelect={handleRoleSelect} />
          )}
          {state.step === "form" && state.role === "donor" && (
            <StepDonor onSuccess={handleSuccess} onBack={handleBack} />
          )}
          {state.step === "form" && state.role === "org" && (
            <StepOrg onSuccess={handleSuccess} onBack={handleBack} />
          )}
          {state.step === "success" && (
            <StepSuccess role={state.role} onContinue={onComplete} />
          )}
        </div>
      </div>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-2 w-2 rounded-full transition-all ${
          done
            ? "bg-neon"
            : active
            ? "bg-neon-purple ring-4 ring-neon-purple/20"
            : "bg-border"
        }`}
      />
      <span className={`text-xs ${active ? "text-neon-purple font-medium" : "text-muted"}`}>
        {label}
      </span>
    </div>
  );
}
