import { createElement } from "react";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getPdfUser, type PdfUser } from "@/lib/pdf/pdf-auth";
import { corsHeaders, corsPreflight } from "@/lib/api/cors";
import { getCompanySettings } from "@/lib/server/settings.service";
import { pdfResponse } from "@/lib/pdf/render";
import { pdfImageSrc } from "@/lib/pdf/assets";

import { getFactureClientDetail } from "@/lib/server/facture-client.service";
import { getFactureAgenceDetail } from "@/lib/server/facture-agence.service";
import { getFactureLivreurDetail } from "@/lib/server/facture-livreur.service";
import { getExpeditionDetail } from "@/lib/server/expedition.service";
import { getExpeditionLivreurDetail } from "@/lib/server/expedition-livreur.service";
import { getColisDetail } from "@/lib/server/colis.service";

import { FactureClientDocument } from "@/components/pdf/documents/FactureClientDocument";
import { FactureAgenceDocument } from "@/components/pdf/documents/FactureAgenceDocument";
import { FactureLivreurDocument } from "@/components/pdf/documents/FactureLivreurDocument";
import { ExpeditionAgenceDocument } from "@/components/pdf/documents/ExpeditionAgenceDocument";
import { ExpeditionLivreurDocument } from "@/components/pdf/documents/ExpeditionLivreurDocument";
import { ColisTicketDocument } from "@/components/pdf/documents/ColisTicketDocument";

const isStaff = (u: PdfUser) => u.role === "ADMIN" || u.role === "AGENCE";

/** Add CORS headers so the Capacitor app (cross-origin) can fetch PDFs. */
function withCors(req: Request, res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(corsHeaders(req.headers.get("origin")))) res.headers.set(k, v);
  return res;
}
const json = (req: Request, body: unknown, status: number) => withCors(req, NextResponse.json(body, { status }));

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}

/**
 * React-PDF endpoint: GET /api/pdf/<kind>/<id>
 * Auth = web cookie OR mobile bearer. Per-kind ownership enforced here; data
 * comes from the existing services. No headless browser.
 */
export async function GET(req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const user = await getPdfUser(req);
  if (!user) return json(req, { message: "Non autorisé." }, 401);

  const { kind, id } = await params;
  const company = await getCompanySettings();
  const logoSrc = await pdfImageSrc(company.logo);
  const send = async (el: ReturnType<typeof createElement>, filename: string) =>
    withCors(req, await pdfResponse(el, filename));

  switch (kind) {
    case "facture-client": {
      const f = await getFactureClientDetail(id);
      if (!f) return json(req, { message: "Facture introuvable." }, 404);
      if (user.role === "CLIENT") { if (f.clientId !== user.clientId) return json(req, { message: "Accès refusé." }, 403); }
      else if (!isStaff(user)) return json(req, { message: "Accès refusé." }, 403);
      return send(createElement(FactureClientDocument, { facture: f, company, logoSrc }), `facture-${f.reference}.pdf`);
    }
    case "facture-agence": {
      if (!isStaff(user)) return json(req, { message: "Accès refusé." }, 403);
      const f = await getFactureAgenceDetail(id);
      if (!f) return json(req, { message: "Facture introuvable." }, 404);
      return send(createElement(FactureAgenceDocument, { facture: f, company, logoSrc }), `facture-agence-${f.reference}.pdf`);
    }
    case "facture-livreur": {
      const f = await getFactureLivreurDetail(id);
      if (!f) return json(req, { message: "Facture introuvable." }, 404);
      if (user.role === "LIVREUR") { if (f.livreurId !== user.livreurId) return json(req, { message: "Accès refusé." }, 403); }
      else if (!isStaff(user)) return json(req, { message: "Accès refusé." }, 403);
      return send(createElement(FactureLivreurDocument, { facture: f, company, logoSrc }), `reglement-livreur-${f.reference}.pdf`);
    }
    case "expedition-agence": {
      if (!isStaff(user)) return json(req, { message: "Accès refusé." }, 403);
      const e = await getExpeditionDetail(id);
      if (!e) return json(req, { message: "Expédition introuvable." }, 404);
      if (user.role === "AGENCE" && user.agenceId !== e.agenceSourceId && user.agenceId !== e.agenceDestId) return json(req, { message: "Accès refusé." }, 403);
      return send(createElement(ExpeditionAgenceDocument, { expedition: e, company, logoSrc }), `expedition-${e.reference}.pdf`);
    }
    case "expedition-livreur": {
      const e = await getExpeditionLivreurDetail(id);
      if (!e) return json(req, { message: "Dispatch introuvable." }, 404);
      if (user.role === "LIVREUR") { if (e.livreurId !== user.livreurId) return json(req, { message: "Accès refusé." }, 403); }
      else if (user.role === "AGENCE") { if (user.agenceId !== e.agenceId) return json(req, { message: "Accès refusé." }, 403); }
      else if (user.role !== "ADMIN") return json(req, { message: "Accès refusé." }, 403);
      return send(createElement(ExpeditionLivreurDocument, { dispatch: e, company, logoSrc }), `dispatch-${e.reference}.pdf`);
    }
    case "colis-ticket": {
      const c = await getColisDetail(decodeURIComponent(id));
      if (!c) return json(req, { message: "Colis introuvable." }, 404);
      // Staff + livreurs may print any ticket; a client only its own.
      if (user.role === "CLIENT" && c.clientId !== user.clientId) return json(req, { message: "Accès refusé." }, 403);
      const qrDataUri = await QRCode.toDataURL(c.trk, { margin: 1, width: 240, errorCorrectionLevel: "M" });
      return send(createElement(ColisTicketDocument, { colis: c, company, logoSrc, qrDataUri }), `ticket-${c.trk}.pdf`);
    }
    default:
      return json(req, { message: "Type de document non supporté." }, 400);
  }
}
