import Link from "next/link";
import { Truck } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm">
        <Truck className="h-4 w-4 text-brand" />
        <span>Ramassage disponible 7j/7 partout au Maroc</span>
      </div>
    </div>
  );
}
