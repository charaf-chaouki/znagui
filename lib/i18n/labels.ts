import type { Locale } from "./config";
import { translate, type MessageKey } from "./dictionaries";
import type {
  ColisStatut, RamassageStatut, ExpeditionStatut, ExpeditionLivreurStatut,
  FactureStatut, AccountStatus, ColisType,
} from "@prisma/client";
import type { ColisRamassageState } from "@/lib/types/ramassage";
import type { DispatchColisState } from "@/lib/types/expedition-livreur";

// Enum values map 1:1 to dictionary keys (e.g. "st.colis.LIVRE"); the cast is safe
// because every enum value has a matching key in the dictionary.
const k = (s: string) => s as MessageKey;

export const colisStatutLabel = (l: Locale, s: ColisStatut) => translate(l, k(`st.colis.${s}`));
export const ramStatutLabel = (l: Locale, s: RamassageStatut) => translate(l, k(`st.ram.${s}`));
export const colisRamLabel = (l: Locale, s: ColisRamassageState) => translate(l, k(`st.colisram.${s}`));
export const expStatutLabel = (l: Locale, s: ExpeditionStatut) => translate(l, k(`st.exp.${s}`));
export const expLivStatutLabel = (l: Locale, s: ExpeditionLivreurStatut) => translate(l, k(`st.expliv.${s}`));
export const dispatchStateLabel = (l: Locale, s: DispatchColisState) => translate(l, k(`st.dispatch.${s}`));
export const factureStatutLabel = (l: Locale, s: FactureStatut) => translate(l, k(`st.facture.${s}`));
export const factureLivStatutLabel = (l: Locale, s: FactureStatut) => translate(l, k(`st.factureliv.${s}`));
export const accountStatutLabel = (l: Locale, s: AccountStatus) => translate(l, k(`st.account.${s}`));
export const colisTypeLabel = (l: Locale, t: ColisType) => translate(l, t === "INTRA" ? "type.intra" : "type.inter");
// Facture line role: the service returns the FR label, which maps 1:1 to a "role.<label>" key.
export const roleLabel = (l: Locale, role: string) => translate(l, k(`role.${role}`));
