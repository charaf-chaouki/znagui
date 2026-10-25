import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { getCompanySettingsCached } from "@/lib/server/settings.service";

const SERVICES = ["Ramassage", "Livraison", "Retour colis", "Collecte cash", "Stockage"];
const LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
  { label: "S'inscrire", href: "/inscription" },
];

// lucide v1 removed brand icons → inline SVG glyphs
const GLYPHS: Record<string, React.ReactNode> = {
  Facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  Instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  YouTube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.37z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </>
  ),
  TikTok: <path d="M9 12a4 4 0 1 0 4 4V4c.5 2.5 2.5 4 5 4" />,
  WhatsApp: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
  ),
};

function waLink(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export async function Footer() {
  const c = await getCompanySettingsCached();

  const socials = [
    { label: "Facebook", href: c.facebook },
    { label: "Instagram", href: c.instagram },
    { label: "LinkedIn", href: c.linkedin },
    { label: "YouTube", href: c.youtube },
    { label: "TikTok", href: c.tiktok },
    { label: "WhatsApp", href: waLink(c.whatsapp) },
  ].filter((s) => s.href.trim().length > 0);

  const adresse = [c.adresse, c.ville].filter(Boolean).join(", ") || "Maroc";

  return (
    <footer className="bg-[#070707] text-white/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="white" href={null} heightClass="h-8" />
          <p className="mt-4 text-sm leading-relaxed">
            Znagui Express assure la collecte, la livraison et le retour de vos colis partout au
            Maroc avec un suivi dédié de premier ordre.
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70 transition hover:bg-brand hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {GLYPHS[s.label]}
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">Nos services</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s}>
                <Link href="/#services" className="hover:text-brand">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">Liens utiles</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-brand">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">Contactez-nous</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {adresse}
            </li>
            {c.telephone && (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`tel:${c.telephone.replace(/\s/g, "")}`} className="hover:text-brand">{c.telephone}</a>
              </li>
            )}
            {c.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`mailto:${c.email}`} className="hover:text-brand">{c.email}</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-white/50">
          © 2026 {c.nomCommercial || "Znagui Express"}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
