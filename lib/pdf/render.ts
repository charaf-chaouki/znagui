import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

// Any React-PDF document element; the exact DocumentProps typing is applied at
// the renderToBuffer call so callers can pass a createElement(...) result.
type PdfDoc = ReactElement;

/**
 * Render a React-PDF <Document> to real PDF bytes and return it as an HTTP
 * response. No headless browser involved — pure Node rendering via
 * @react-pdf/renderer, so it works identically on any server (and the mobile
 * app simply downloads these bytes from the API).
 */
export async function pdfResponse(
  doc: PdfDoc,
  filename: string,
  disposition: "inline" | "attachment" = "inline",
): Promise<NextResponse> {
  const buffer = await renderToBuffer(doc as ReactElement<DocumentProps>);
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
