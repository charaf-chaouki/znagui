// Tracking view types (presentational for now; wired to the API in a later phase).

export type TrackingStage = "done" | "current" | "upcoming";

export type StatusTone = "done" | "progress" | "pending" | "failed";

export interface TrackingEvent {
  label: string;
  city?: string;
  date?: string;
  stage: TrackingStage;
}

export interface TrackingInfo {
  trk: string;
  status: string;
  statusTone: StatusTone;
  pickupCity: string;
  destinationCity: string;
  recipientName: string;
  vehicle?: string;
  /** true until the real tracking API is wired (phase Colis) */
  demo?: boolean;
  events: TrackingEvent[];
}
