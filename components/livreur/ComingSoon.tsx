import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";

export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="space-y-4">
      <Link href="/livreur" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <Hammer className="h-7 w-7" />
        </div>
        <p className="mt-4 font-semibold text-foreground">Bientôt disponible</p>
        <p className="mt-1 text-sm text-muted">{note ?? "Ce module est en cours de construction."}</p>
      </div>
    </div>
  );
}
