import type { CSSProperties } from "react";

/** Base shimmer block. Compose these to mirror the shape of content being loaded. */
export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} style={style} />;
}
