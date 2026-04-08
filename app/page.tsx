"use client";

import { useState, useCallback } from "react";
import UploadZone from "@/components/upload-zone";
import AnalysisStream from "@/components/analysis-stream";

type Lang = "de" | "en";

const UI_TEXT = {
  de: {
    tagline: "Schonungslos ehrliche Innendesign-Bewertung",
    analyzing: "Raum wird analysiert",
    analyzingDesc:
      "Farbpalette, Designstil, Beleuchtung, Raumlayout und Verbesserungsvorschläge werden ausgewertet. Dauert 10-20 Sekunden.",
    colorTheory: "Farbtheorie",
    styleMatch: "Stil-Match",
    lighting: "Beleuchtung",
    spatialFlow: "Raumfluss",
    score: "Bewertung 1-10",
    tips: "5 Tipps",
    downloadPdf: "Als PDF herunterladen",
    roomNamePlaceholder: "Raumname (z.B. Wohnzimmer)",
  },
  en: {
    tagline: "Brutally honest interior design review",
    analyzing: "Analyzing your room",
    analyzingDesc:
      "Evaluating color palette, design style, lighting, spatial layout, and preparing suggestions. This takes 10-20 seconds.",
    colorTheory: "Color Theory",
    styleMatch: "Style Match",
    lighting: "Lighting",
    spatialFlow: "Spatial Flow",
    score: "Score 1-10",
    tips: "5 Tips",
    downloadPdf: "Download as PDF",
    roomNamePlaceholder: "Room name (e.g. Living Room)",
  },
};

export default function Home() {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("de");
  const [roomName, setRoomName] = useState("");

  const t = UI_TEXT[lang];

  const handleUpload = useCallback(
    async (base64: string, mimeType: string) => {
      setHasUploaded(true);
      setContent("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType, lang }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Server error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setContent((prev) => prev + chunk);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setContent(`## ERROR\n\n${msg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [lang]
  );

  const handleReset = useCallback(() => {
    setHasUploaded(false);
    setContent("");
    setIsLoading(false);
    setRoomName("");
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    const el = document.getElementById("analysis-content");
    if (!el) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const title = roomName
      ? `Ilona's Interior Design Critic — ${roomName}`
      : "Ilona's Interior Design Critic";

    const opt = {
      margin: [12, 15, 12, 15],
      filename: `${title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").replace(/\s+/g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f5f0eb",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Create a wrapper with the title styled to match
    const wrapper = document.createElement("div");
    wrapper.style.fontFamily = "'Space Grotesk', system-ui, sans-serif";
    wrapper.style.color = "#111";
    wrapper.style.background = "#f5f0eb";
    wrapper.style.padding = "20px";

    const header = document.createElement("div");
    header.style.borderBottom = "3px solid #111";
    header.style.paddingBottom = "16px";
    header.style.marginBottom = "24px";

    const h1 = document.createElement("h1");
    h1.textContent = "ILONA'S INTERIOR DESIGN CRITIC";
    h1.style.fontSize = "22px";
    h1.style.fontWeight = "700";
    h1.style.letterSpacing = "-0.5px";
    h1.style.margin = "0";

    if (roomName) {
      const sub = document.createElement("p");
      sub.textContent = roomName.toUpperCase();
      sub.style.fontSize = "11px";
      sub.style.fontWeight = "700";
      sub.style.letterSpacing = "3px";
      sub.style.color = "#888";
      sub.style.marginTop = "6px";
      sub.style.margin = "6px 0 0 0";
      header.appendChild(h1);
      header.appendChild(sub);
    } else {
      header.appendChild(h1);
    }

    wrapper.appendChild(header);

    const contentClone = el.cloneNode(true) as HTMLElement;

    // Add page-break-inside: avoid to each section so they don't split
    const sections = contentClone.querySelectorAll(":scope > div > div");
    sections.forEach((section) => {
      (section as HTMLElement).style.pageBreakInside = "avoid";
      (section as HTMLElement).style.breakInside = "avoid";
    });

    // Also prevent breaks inside prose blocks and the score section
    const proseBlocks = contentClone.querySelectorAll(".prose, [class*='score']");
    proseBlocks.forEach((block) => {
      (block as HTMLElement).style.pageBreakInside = "avoid";
      (block as HTMLElement).style.breakInside = "avoid";
    });

    wrapper.appendChild(contentClone);

    // Footer: "Analysis by Ilona Socolov"
    const footer = document.createElement("div");
    footer.style.borderTop = "2px solid #111";
    footer.style.marginTop = "32px";
    footer.style.paddingTop = "12px";
    footer.style.fontSize = "11px";
    footer.style.fontWeight = "600";
    footer.style.letterSpacing = "2px";
    footer.style.textTransform = "uppercase";
    footer.style.color = "#888";
    footer.textContent = "Analysis by Ilona Socolov";
    wrapper.appendChild(footer);

    html2pdf().set(opt).from(wrapper).save();
  }, [roomName]);

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="w-full border-b-3 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-none">
              ILONA&apos;S INTERIOR
              <br />
              DESIGN CRITIC
            </h1>
            <p className="mt-2 text-sm font-medium tracking-widest uppercase text-muted">
              {t.tagline}
            </p>
          </div>

          {/* Language toggle */}
          <div className="flex border-3 border-foreground shrink-0">
            <button
              onClick={() => setLang("de")}
              className={`px-3 py-1.5 text-xs font-bold tracking-widest transition-colors ${
                lang === "de"
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground hover:bg-foreground/10"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-xs font-bold tracking-widest border-l-3 border-foreground transition-colors ${
                lang === "en"
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground hover:bg-foreground/10"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
        <UploadZone
          onUpload={handleUpload}
          isAnalyzing={isLoading}
          onReset={handleReset}
        />

        {/* Loading state */}
        {isLoading && !content && (
          <div className="mt-8 border-t-3 border-foreground pt-8">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-foreground animate-pulse" />
                <div className="w-3 h-3 bg-foreground animate-pulse [animation-delay:150ms]" />
                <div className="w-3 h-3 bg-foreground animate-pulse [animation-delay:300ms]" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase">
                {t.analyzing}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted tracking-wide">
              {t.analyzingDesc}
            </p>
          </div>
        )}

        {/* Streamed results */}
        {hasUploaded && content && (
          <>
            <div id="analysis-content">
              <AnalysisStream content={content} isStreaming={isLoading} />
            </div>

            {/* PDF download controls */}
            {!isLoading && !content.includes("## ERROR") && (
              <div className="mt-8 border-t-3 border-foreground pt-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder={t.roomNamePlaceholder}
                    className="flex-1 border-3 border-foreground bg-transparent px-4 py-3 text-sm font-bold tracking-wide placeholder:text-muted/50 focus:outline-none focus:bg-surface"
                  />
                  <button
                    onClick={handleDownloadPdf}
                    className="border-3 border-foreground bg-foreground text-background px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-muted transition-colors shrink-0"
                  >
                    {t.downloadPdf}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Feature grid (before upload) */}
        {!hasUploaded && (
          <div className="mt-12 border-t-2 border-foreground/10 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold tracking-widest uppercase text-muted">
              <div className="border-2 border-foreground/10 p-4">
                {t.colorTheory}
              </div>
              <div className="border-2 border-foreground/10 p-4">
                {t.styleMatch}
              </div>
              <div className="border-2 border-foreground/10 p-4">
                {t.lighting}
              </div>
              <div className="border-2 border-foreground/10 p-4">
                {t.spatialFlow}
              </div>
              <div className="border-2 border-foreground/10 p-4">
                {t.score}
              </div>
              <div className="border-2 border-foreground/10 p-4">
                {t.tips}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
