import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getColisDetail } from "@/lib/server/colis.service";
import { ColisTicket } from "@/components/colis/ColisTicket";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ trk: string }> }): Promise<Metadata> {
  const { trk } = await params;
  return { title: `Ticket ${trk}` };
}

export default async function TicketPage({ params }: { params: Promise<{ trk: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const { trk } = await params;
  const colis = await getColisDetail(decodeURIComponent(trk));
  if (!colis) notFound();

  return <ColisTicket colis={colis} />;
}
