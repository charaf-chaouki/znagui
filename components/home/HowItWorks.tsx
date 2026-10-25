import { UserPlus, PackagePlus, Truck, Banknote } from "lucide-react";

const STEPS = [
  { icon: UserPlus, title: "Créez votre compte", desc: "Inscription gratuite en 2 minutes, sans engagement." },
  { icon: PackagePlus, title: "Saisissez vos colis", desc: "Ajoutez vos commandes depuis le tableau de bord." },
  { icon: Truck, title: "On s'en occupe", desc: "Ramassage et livraison à votre client sans effort." },
  { icon: Banknote, title: "Recevez votre argent", desc: "Le montant collecté vous est reversé après livraison." },
];

export function HowItWorks() {
  return (
    <section id="comment" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Processus</span>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Comment ça marche ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            En 4 étapes simples, expédiez vos colis et recevez votre argent.
          </p>
        </div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-4">
          {/* connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-brand/20 md:block" />
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-contrast shadow-lg ring-8 ring-surface">
                <s.icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0a] text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-bold text-foreground">{s.title}</h3>
              <p className="mt-1.5 max-w-[14rem] text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
