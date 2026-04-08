"use client";

import { useState, useCallback } from "react";
import UploadZone from "@/components/upload-zone";
import AnalysisStream from "@/components/analysis-stream";

export default function Home() {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = useCallback(async (base64: string, mimeType: string) => {
    setHasUploaded(true);
    setContent("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
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
  }, []);

  const handleReset = useCallback(() => {
    setHasUploaded(false);
    setContent("");
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="w-full border-b-3 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-none">
            ROOM CRITIC
          </h1>
          <p className="mt-2 text-sm font-medium tracking-widest uppercase text-muted">
            Brutally honest interior design review
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
        <UploadZone
          onUpload={handleUpload}
          isAnalyzing={isLoading}
          onReset={handleReset}
        />

        {hasUploaded && (
          <AnalysisStream content={content} isStreaming={isLoading} />
        )}

        {!hasUploaded && (
          <div className="mt-12 border-t-2 border-foreground/10 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold tracking-widest uppercase text-muted">
              <div className="border-2 border-foreground/10 p-4">
                Color Theory
              </div>
              <div className="border-2 border-foreground/10 p-4">
                Style Match
              </div>
              <div className="border-2 border-foreground/10 p-4">
                Lighting
              </div>
              <div className="border-2 border-foreground/10 p-4">
                Spatial Flow
              </div>
              <div className="border-2 border-foreground/10 p-4">
                Score 1-10
              </div>
              <div className="border-2 border-foreground/10 p-4">
                5 Tips
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 border-foreground/10">
        <div className="max-w-3xl mx-auto px-6 py-4 text-xs text-muted tracking-wide">
          Powered by Claude
        </div>
      </footer>
    </div>
  );
}
