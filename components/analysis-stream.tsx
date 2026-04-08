"use client";

import ReactMarkdown from "react-markdown";

interface AnalysisStreamProps {
  content: string;
  isStreaming: boolean;
}

export default function AnalysisStream({
  content,
  isStreaming,
}: AnalysisStreamProps) {
  if (!content) return null;

  // Split content by h2 headers to create sections
  const sections = content.split(/(?=^## )/m).filter(Boolean);

  return (
    <div className="w-full mt-8">
      {/* Section divider */}
      <div className="border-t-3 border-foreground mb-8" />

      {sections.map((section, i) => {
        // Check if this is the score section for special treatment
        const isScoreSection =
          section.includes("## OVERALL SCORE") ||
          section.includes("## Overall Score");

        return (
          <div key={i}>
            {i > 0 && <div className="border-t-2 border-foreground my-8" />}

            {isScoreSection ? (
              <ScoreSection content={section} />
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown>{section}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}

      {isStreaming && (
        <div className="mt-6 flex items-center gap-3">
          <div className="w-2 h-2 bg-foreground animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-muted">
            Analyzing
          </span>
        </div>
      )}
    </div>
  );
}

function ScoreSection({ content }: { content: string }) {
  // Extract score number (e.g., "7.2" from the content)
  const scoreMatch = content.match(/(\d+\.?\d*)\s*\/\s*10|(\d+\.?\d*)/);
  const score = scoreMatch ? scoreMatch[1] || scoreMatch[2] : null;

  // Extract tags (bold text like **WARM TONES**)
  const tags = [...content.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);

  // Extract the verdict line (first non-header, non-tag paragraph)
  const lines = content.split("\n").filter((l) => l.trim());
  const verdictLine = lines.find(
    (l) =>
      !l.startsWith("#") &&
      !l.includes("**") &&
      l.trim().length > 10 &&
      !/^\d/.test(l.trim())
  );

  return (
    <div>
      <h2 className="text-xs font-bold tracking-[2px] uppercase text-muted mb-6">
        Overall Score
      </h2>

      {score && (
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-7xl font-bold tracking-tight leading-none">
            {score}
          </span>
          <span className="text-2xl font-bold text-muted">/10</span>
        </div>
      )}

      {verdictLine && (
        <p className="text-lg leading-relaxed text-foreground/80 mb-6">
          {verdictLine.trim()}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-foreground text-background px-3 py-1 text-xs font-bold tracking-widest"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
