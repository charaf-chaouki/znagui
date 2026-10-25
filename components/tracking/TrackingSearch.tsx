"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function TrackingSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [trk, setTrk] = useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = trk.trim();
    if (v) router.push(`/suivi/${encodeURIComponent(v)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 shadow-sm"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-muted" />
      <input
        value={trk}
        onChange={(e) => setTrk(e.target.value)}
        placeholder="Entrez votre numéro de suivi (ex : TRK-A1B2C3)"
        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
      >
        Suivre
      </button>
    </form>
  );
}
