import { MessageCircle } from "lucide-react";
import { getCompanySettingsCached } from "@/lib/server/settings.service";

export async function WhatsAppButton() {
  const c = await getCompanySettingsCached();
  const digits = c.whatsapp.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-xl transition hover:scale-105 hover:bg-brand-dark"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-40" />
      <MessageCircle className="relative h-7 w-7" />
    </a>
  );
}
