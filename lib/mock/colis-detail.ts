import { colisList, type MockColis } from "@/lib/mock/admin";
import type { ColisStatut } from "@/lib/types/colis";

export type HistoEvent = { statut: ColisStatut; label: string; city: string; date: string };

export type MockColisDetail = MockColis & {
  recipient: string;
  recipientPhone: string;
  pickupAddress: string;
  destAddress: string;
  contents: string;
  parcelCount: number;
  notes: string;
  events: HistoEvent[];
};

export function findMockColis(trk: string): MockColis | undefined {
  return colisList.find((c) => c.trk === trk);
}

const RECIPIENTS = ["Khalid Idrissi", "Amine Sbai", "Hind Alaoui", "Mounir Kabbaj", "Sofia Rami", "Yassine Oubella"];
const CONTENTS = ["Téléphone Samsung A55", "Paire de chaussures", "Vêtements", "Accessoires téléphone", "Produits cosmétiques", "Livres"];

const LABELS: Record<ColisStatut, string> = {
  CREE: "Colis créé",
  DISPONIBLE_A_RAMASSER: "Disponible à ramasser",
  AFFECTE_RAMASSAGE: "Affecté au ramassage",
  RAMASSE: "Ramassé par le livreur",
  RECU_ENTREPOT_SOURCE: "Reçu à l'entrepôt source",
  EN_EXPEDITION: "En transit entre agences",
  RECU_PAR_AGENCE_DEST: "Reçu par l'agence de destination",
  DISPATCHE_LIVREUR: "Dispatché au livreur",
  EN_COURS_DE_LIVRAISON: "En cours de livraison",
  LIVRE: "Livré au destinataire",
  REPORTE: "Livraison reportée",
  PAS_DE_REPONSE: "Destinataire injoignable",
  REFUSE: "Colis refusé",
  RETOUR: "Colis retourné",
  ANNULE: "Colis annulé",
};

const INTRA = ["CREE", "DISPONIBLE_A_RAMASSER", "RAMASSE", "EN_COURS_DE_LIVRAISON", "LIVRE"] as const;
const INTER = ["CREE", "AFFECTE_RAMASSAGE", "RAMASSE", "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION", "RECU_PAR_AGENCE_DEST", "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE"] as const;
const TIMES = ["09:12", "10:40", "11:55", "13:20", "15:05", "17:30", "08:15", "09:40", "11:10"];

function cityFor(s: ColisStatut, pickup: string, dest: string): string {
  if (s === "EN_EXPEDITION") return `${pickup} → ${dest}`;
  if (["RECU_PAR_AGENCE_DEST", "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE"].includes(s)) return dest;
  return pickup;
}

export function buildColisDetail(trk: string): MockColisDetail | undefined {
  const c = findMockColis(trk);
  if (!c) return undefined;

  const hash = trk.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const flow = (c.type === "INTRA" ? INTRA : INTER) as readonly ColisStatut[];

  let path: ColisStatut[];
  if (c.statut === "ANNULE") path = ["CREE", "ANNULE"];
  else if (c.statut === "RETOUR") path = [...flow.slice(0, flow.indexOf("EN_COURS_DE_LIVRAISON") + 1), "RETOUR"];
  else {
    const idx = flow.indexOf(c.statut);
    path = idx >= 0 ? [...flow.slice(0, idx + 1)] : ["CREE"];
  }

  const events: HistoEvent[] = path.map((s, i) => ({
    statut: s,
    label: LABELS[s],
    city: cityFor(s, c.pickupCity, c.destCity),
    date: `${c.date} · ${TIMES[i % TIMES.length]}`,
  }));

  return {
    ...c,
    recipient: RECIPIENTS[hash % RECIPIENTS.length],
    recipientPhone: "06 12 34 56 78",
    pickupAddress: `Quartier Centre, Rue 12, ${c.pickupCity}`,
    destAddress: `Avenue Hassan II, Résidence Al Andalous, ${c.destCity}`,
    contents: CONTENTS[hash % CONTENTS.length],
    parcelCount: 1 + (hash % 3),
    notes: hash % 2 === 0 ? "Appeler le destinataire avant la livraison." : "",
    events,
  };
}
