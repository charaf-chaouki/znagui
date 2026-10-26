import "server-only";
import puppeteer from "puppeteer-core";

/** Resolve a Chrome/Chromium executable. Override with CHROME_PATH in production. */
function chromeExecutable(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates[0];
}

/**
 * Render an internal app page (an A4 print page) to a real PDF with headless
 * Chrome. The dashboard chrome (topbar / sidebar) is stripped so only the A4
 * document is produced; the `@page { size: A4 }` CSS governs the page size.
 */
export async function renderPagePdf(url: string, cookie: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    executablePath: chromeExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    if (cookie) await page.setExtraHTTPHeaders({ cookie });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.emulateMediaType("print");
    // Strip the dashboard shell so only the document remains, and let the
    // document flow its full height instead of being clipped to one screen.
    await page.addStyleTag({
      content: `
        header, aside { display: none !important; }
        [class*="h-dvh"] { height: auto !important; overflow: visible !important; display: block !important; }
        main { overflow: visible !important; height: auto !important; padding: 0 !important; }
        [class*="max-w-7xl"] { max-width: none !important; }
        body { background: #ffffff !important; }
      `,
    });
    return await page.pdf({ printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}
