import { MapPin, Phone, Mail, MessageCircle, Navigation } from "lucide-react";
import { getCompanySettingsCached } from "@/lib/server/settings.service";
import { getServerT } from "@/lib/i18n/server";

export async function ContactSection() {
  const c = await getCompanySettingsCached();
  const { t } = await getServerT();

  const adresse = [c.adresse, c.ville].filter(Boolean).join(", ") || t("home.contact.morocco");
  const waDigits = c.whatsapp.replace(/\D/g, "");
  const itineraire = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse)}`;

  return (
    <section id="contact" className="scroll-mt-20 bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">{t("home.contact.eyebrow")}</span>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">{t("home.contact.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">{t("home.contact.sub")}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {/* Map placeholder */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 lg:col-span-3">
            <div className="flex h-72 w-full items-center justify-center bg-[linear-gradient(#1a1a1a_1px,transparent_1px),linear-gradient(90deg,#1a1a1a_1px,transparent_1px)] bg-[size:28px_28px] lg:h-full">
              <img src='/images/map-location.png' alt="" />
            </div>
          </div>

          {/* Contact card */}
          <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10 lg:col-span-2">
            <h3 className="text-xl font-bold">{c.nomCommercial || "Znagui Express"}</h3>
            <p className="mt-2 text-sm text-white/60">{t("home.contact.cardSub")}</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{t("home.contact.address")}</p>
                  <p className="text-white/60">{adresse}</p>
                </div>
              </li>
              {c.telephone && (
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{t("col.telephone")}</p>
                    <a href={`tel:${c.telephone.replace(/\s/g, "")}`} className="text-white/60 hover:text-brand">{c.telephone}</a>
                  </div>
                </li>
              )}
              {c.email && (
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{t("col.email")}</p>
                    <a href={`mailto:${c.email}`} className="text-white/60 hover:text-brand">{c.email}</a>
                  </div>
                </li>
              )}
              {waDigits && (
                <li className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-brand">{c.whatsapp}</a>
                  </div>
                </li>
              )}
            </ul>

            <a
              href={itineraire}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark"
            >
              <Navigation className="h-4 w-4" /> {t("home.contact.itinerary")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
