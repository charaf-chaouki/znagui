import { Truck } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";

export async function TopBar() {
  const { t } = await getServerT();
  return (
    <div className="bg-[#0a0a0a] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm">
        <Truck className="h-4 w-4 text-brand" />
        <span>{t("home.topbar")}</span>
      </div>
    </div>
  );
}
