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
                Analyzing your room
              </span>
            </div>
            <p className="mt-3 text-xs text-muted tracking-wide">
              Evaluating color palette, design style, lighting, spatial layout, and preparing suggestions. This takes 10-20 seconds.
            </p>
          </div>
        )}

        {/* Streamed results */}
        {hasUploaded && content && (
          <AnalysisStream content={content} isStreaming={isLoading} />
        )}

        {/* Feature grid (before upload) */}
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
    </div>
  );
}
