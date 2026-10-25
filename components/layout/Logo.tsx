import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** "color" = green/black logo for light backgrounds · "white" = for dark/green backgrounds */
  variant?: "color" | "white";
  /** wrap in a link; pass null to render the image only */
  href?: string | null;
  /** tailwind height class, e.g. "h-9" (width auto-scales, logo is 800×199) */
  heightClass?: string;
  priority?: boolean;
  className?: string;
};

export function Logo({
  variant = "color",
  href = "/",
  heightClass = "h-9",
  priority = false,
  className = "",
}: LogoProps) {
  const src = variant === "white" ? "/images/logo-white.png" : "/images/logo.png";

  const img = (
    <Image
      src={src}
      alt="Znagui Express"
      width={800}
      height={199}
      priority={priority}
      className={`${heightClass} w-auto ${className}`}
    />
  );

  if (href === null) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Znagui Express — accueil">
      {img}
    </Link>
  );
}
