import { createElement } from "react";
import { NextResponse } from "next/server";
import { getPdfUser, type PdfUser } from "@/lib/pdf/pdf-auth";
import { getCompanySettings } from "@/lib/server/settings.service";
import { pdfResponse } from "@/lib/pdf/render";
import { pdfImageSrc } from "@/lib/pdf/assets";

import { getFactureClientDetail } from "@/lib/server/facture-client.service";
import { getFactureAgenceDetail } from "@/lib/server/facture-agence.service";
import { getFactureLivreurDetail } from "@/lib/server/facture-livreur.service";
import { getExpeditionDetail } from "@/lib/server/expedition.service";
import { getExpeditionLivreurDetail } from "@/lib/server/expedition-livreur.service";

import { FactureClientDocument } from "@/components/pdf/documents/FactureClientDocument";
import { FactureAgenceDocument } from "@/components/pdf/documents/FactureAgenceDocument";
import { FactureLivreurDocument } from "@/components/pdf/documents/FactureLivreurDocument";
import { ExpeditionAgenceDocument } from "@/components/pdf/documents/ExpeditionAgenceDocument";
import { ExpeditionLivreurDocument } from "@/components/pdf/documents/ExpeditionLivreurDocument";

const forbidden = () => NextResponse.json({ message: "Accès refusé." }, { status: 403 });
const missing = () => NextResponse.json({ message: "Document introuvable." }, { status: 404 });
const isStaff = (u: PdfUser) => u.role === "ADMIN" || u.role === "AGENCE";

/**
 * React-PDF endpoint: GET /api/pdf/<kind>/<id>
 * Auth = web cookie OR mobile bearer. Per-kind ownership is enforced here;
 * data comes from the existing services. No headless browser.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const user = await getPdfUser(_req);
  if (!user) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const { kind, id } = await params;
  const company = await getCompanySettings();
  const logoSrc = await pdfImageSrc(company.logo);

  switch (kind) {
    case "facture-client": {
      const f = await getFactureClientDetail(id);
      if (!f) return missing();
      if (user.role === "CLIENT") { if (f.clientId !== user.clientId) return forbidden(); }
      else if (!isStaff(user)) return forbidden();
      return pdfResponse(createElement(FactureClientDocument, { facture: f, company, logoSrc }), `facture-${f.reference}.pdf`);
    }
    case "facture-agence": {
      if (!isStaff(user)) return forbidden();
      const f = await getFactureAgenceDetail(id);
      if (!f) return missing();
      return pdfResponse(createElement(FactureAgenceDocument, { facture: f, company, logoSrc }), `facture-agence-${f.reference}.pdf`);
    }
    case "facture-livreur": {
      const f = await getFactureLivreurDetail(id);
      if (!f) return missing();
      if (user.role === "LIVREUR") { if (f.livreurId !== user.livreurId) return forbidden(); }
      else if (!isStaff(user)) return forbidden();
      return pdfResponse(createElement(FactureLivreurDocument, { facture: f, company, logoSrc }), `reglement-livreur-${f.reference}.pdf`);
    }
    case "expedition-agence": {
      if (!isStaff(user)) return forbidden();
      const e = await getExpeditionDetail(id);
      if (!e) return missing();
      if (user.role === "AGENCE" && user.agenceId !== e.agenceSourceId && user.agenceId !== e.agenceDestId) return forbidden();
      return pdfResponse(createElement(ExpeditionAgenceDocument, { expedition: e, company, logoSrc }), `expedition-${e.reference}.pdf`);
    }
    case "expedition-livreur": {
      const e = await getExpeditionLivreurDetail(id);
      if (!e) return missing();
      if (user.role === "LIVREUR") { if (e.livreurId !== user.livreurId) return forbidden(); }
      else if (user.role === "AGENCE") { if (user.agenceId !== e.agenceId) return forbidden(); }
      else if (user.role !== "ADMIN") return forbidden();
      return pdfResponse(createElement(ExpeditionLivreurDocument, { dispatch: e, company, logoSrc }), `dispatch-${e.reference}.pdf`);
    }
    default:
      return NextResponse.json({ message: "Type de document non supporté." }, { status: 400 });
  }
}
