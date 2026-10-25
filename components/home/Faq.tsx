"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Combien de temps dure la livraison ?",
    a: "La livraison se fait généralement sous 24 à 48h selon la ville de destination. Les livraisons intra-ville sont souvent assurées le jour même.",
  },
  {
    q: "Quels sont les tarifs de ramassage ?",
    a: "Le ramassage à votre adresse est gratuit. Vous ne payez que le tarif de livraison, qui dépend de la zone (même ville ou inter-villes).",
  },
  {
    q: "Comment suivre mon colis ?",
    a: "Chaque colis reçoit un numéro de suivi TRK. Saisissez-le dans la barre de suivi en haut de la page pour voir son statut en temps réel.",
  },
  {
    q: "Quand suis-je payé ?",
    a: "Le montant à collecter est encaissé par le livreur à la livraison, puis reversé selon le calendrier de règlement de votre agence.",
  },
  {
    q: "Est-ce que vous couvrez toutes les villes du Maroc ?",
    a: "Notre réseau d'agences couvre les principales villes du Maroc et s'étend continuellement. Contactez-nous pour vérifier votre zone.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">FAQ</span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Questions fréquentes</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Nous avons une question ? Voici nos réponses aux interrogations les plus courantes.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-foreground">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
