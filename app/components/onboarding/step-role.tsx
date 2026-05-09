"use client";

import { useI18n } from "../../i18n/context";
import type { Role } from "./onboarding-modal";

interface StepRoleProps {
  onSelect: (role: Role) => void;
}

export function StepRole({ onSelect }: StepRoleProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-muted">
        {t("role_selection_title")}
      </p>
      <div className="grid gap-3">
        <RoleCard
          icon="🫶"
          title={t("role_donor")}
          description={t("role_donor_desc")}
          onClick={() => onSelect("donor")}
          accent="neon"
        />
        <RoleCard
          icon="🏢"
          title={t("role_org")}
          description={t("role_org_desc")}
          onClick={() => onSelect("org")}
          accent="purple"
        />
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  onClick,
  accent,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  accent: "neon" | "purple";
}) {
  const borderClass =
    accent === "neon"
      ? "hover:border-neon hover:bg-neon/5"
      : "hover:border-neon-purple hover:bg-neon-purple/5";

  return (
    <button
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border-low px-5 py-4 text-left transition-all ${borderClass}`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <svg
        className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
