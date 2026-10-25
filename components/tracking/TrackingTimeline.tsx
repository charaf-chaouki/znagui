import { Check } from "lucide-react";
import type { TrackingEvent } from "@/lib/types/tracking";

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-brand/20">
      {events.map((e, i) => {
        const isDone = e.stage === "done";
        const isCurrent = e.stage === "current";
        return (
          <li key={i} className="mb-7 ml-6 last:mb-0">
            <span
              className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                isDone
                  ? "border-brand bg-brand text-white"
                  : isCurrent
                    ? "border-brand bg-background text-brand"
                    : "border-brand/25 bg-background"
              }`}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" />
              ) : isCurrent ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-brand/25" />
              )}
            </span>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm font-semibold ${isCurrent || isDone ? "text-foreground" : "text-muted"}`}>
                {e.label}
                {e.city && <span className="font-normal text-muted"> — {e.city}</span>}
              </p>
              {e.date && <span className="text-xs text-muted">{e.date}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
