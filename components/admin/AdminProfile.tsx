"use client";

import { useState } from "react";
import { User, KeyRound, Mail, Phone, ShieldCheck } from "lucide-react";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Props = { email: string; phone: string };

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-brand-contrast" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function AdminProfile({ email, phone }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"profil" | "password">("profil");

  return (
    <div className="space-y-5">
      <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <TabButton active={tab === "profil"} onClick={() => setTab("profil")} icon={<User className="h-4 w-4" />}>
          {t("profile.tabProfile")}
        </TabButton>
        <TabButton active={tab === "password"} onClick={() => setTab("password")} icon={<KeyRound className="h-4 w-4" />}>
          {t("profile.tabPassword")}
        </TabButton>
      </div>

      {tab === "profil" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-foreground">{t("profile.accountInfo")}</h3>
          <InfoRow icon={<Mail className="h-4 w-4" />} label={t("profile.email")} value={email} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label={t("profile.phone")} value={phone} />
          <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label={t("profile.role")} value={t("profile.roleAdmin")} />
        </div>
      ) : (
        <PasswordForm />
      )}
    </div>
  );
}
