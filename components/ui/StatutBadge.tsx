"use client";

import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import {
  colisStatutLabel, ramStatutLabel, colisRamLabel, expStatutLabel,
  expLivStatutLabel, dispatchStateLabel, factureStatutLabel, factureLivStatutLabel,
  accountStatutLabel, colisTypeLabel,
} from "@/lib/i18n/labels";
import { COLIS_STATUT_TONE } from "@/lib/colis-ui";
import { RAMASSAGE_STATUT_TONE, COLIS_RAMASSAGE_TONE } from "@/lib/ramassage-ui";
import { EXPEDITION_STATUT_TONE } from "@/lib/expedition-ui";
import { EXP_LIV_STATUT_TONE, DISPATCH_STATE_TONE } from "@/lib/expedition-livreur-ui";
import { FACTURE_STATUT_TONE } from "@/lib/facture-ui";
import type { Tone } from "@/lib/colis-ui";
import type {
  ColisStatut, RamassageStatut, ExpeditionStatut, ExpeditionLivreurStatut,
  FactureStatut, AccountStatus, ColisType,
} from "@prisma/client";
import type { ColisRamassageState } from "@/lib/types/ramassage";
import type { DispatchColisState } from "@/lib/types/expedition-livreur";

const ACCOUNT_TONE: Record<AccountStatus, Tone> = {
  ACTIVE: "success", PENDING: "warning", SUSPENDED: "danger", INACTIVE: "neutral",
};

export function ColisStatutBadge({ statut }: { statut: ColisStatut }) {
  const { locale } = useI18n();
  return <Badge tone={COLIS_STATUT_TONE[statut]}>{colisStatutLabel(locale, statut)}</Badge>;
}

export function ColisTypeBadge({ type }: { type: ColisType }) {
  const { locale } = useI18n();
  return <Badge tone={type === "INTRA" ? "neutral" : "info"}>{colisTypeLabel(locale, type)}</Badge>;
}

export function RamassageStatutBadge({ statut }: { statut: RamassageStatut }) {
  const { locale } = useI18n();
  return <Badge tone={RAMASSAGE_STATUT_TONE[statut]}>{ramStatutLabel(locale, statut)}</Badge>;
}

export function ColisRamBadge({ state }: { state: ColisRamassageState }) {
  const { locale } = useI18n();
  return <Badge tone={COLIS_RAMASSAGE_TONE[state]}>{colisRamLabel(locale, state)}</Badge>;
}

export function ExpeditionStatutBadge({ statut }: { statut: ExpeditionStatut }) {
  const { locale } = useI18n();
  return <Badge tone={EXPEDITION_STATUT_TONE[statut]}>{expStatutLabel(locale, statut)}</Badge>;
}

export function ExpLivStatutBadge({ statut }: { statut: ExpeditionLivreurStatut }) {
  const { locale } = useI18n();
  return <Badge tone={EXP_LIV_STATUT_TONE[statut]}>{expLivStatutLabel(locale, statut)}</Badge>;
}

export function DispatchStateBadge({ state }: { state: DispatchColisState }) {
  const { locale } = useI18n();
  return <Badge tone={DISPATCH_STATE_TONE[state]}>{dispatchStateLabel(locale, state)}</Badge>;
}

export function FactureStatutBadge({ statut }: { statut: FactureStatut }) {
  const { locale } = useI18n();
  return <Badge tone={FACTURE_STATUT_TONE[statut]}>{factureStatutLabel(locale, statut)}</Badge>;
}

export function FactureLivStatutBadge({ statut }: { statut: FactureStatut }) {
  const { locale } = useI18n();
  return <Badge tone={FACTURE_STATUT_TONE[statut]}>{factureLivStatutLabel(locale, statut)}</Badge>;
}

export function AccountStatutBadge({ statut }: { statut: AccountStatus }) {
  const { locale } = useI18n();
  return <Badge tone={ACCOUNT_TONE[statut]}>{accountStatutLabel(locale, statut)}</Badge>;
}
