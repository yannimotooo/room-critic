"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onUpload: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
  onReset: () => void;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadZone({
  onUpload,
  isAnalyzing,
  onReset,
}: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("UNSUPPORTED FORMAT. USE JPG, PNG, OR WEBP.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("FILE TOO LARGE. MAX 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64 = result.split(",")[1];
        onUpload(base64, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleClick = () => {
    if (!preview && !isAnalyzing) {
      inputRef.current?.click();
    }
  };

  const handleReset = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onReset();
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={handleClick}
        className={`
          relative w-full border-3 border-foreground transition-colors
          ${preview ? "cursor-default" : "cursor-pointer"}
          ${dragOver ? "bg-foreground" : ""}
        `}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded room"
              className="w-full max-h-[500px] object-contain bg-black"
            />
            {!isAnalyzing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="absolute top-0 right-0 bg-foreground text-background px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-muted transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div
              className={`text-2xl font-bold tracking-tight mb-2 ${dragOver ? "text-background" : "text-foreground"}`}
            >
              DROP IMAGE
            </div>
            <div
              className={`text-xs tracking-widest uppercase ${dragOver ? "text-background/60" : "text-muted"}`}
            >
              or click to select
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface overflow-hidden">
            <div className="h-full bg-foreground animate-pulse w-full" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 px-4 py-2 bg-foreground text-background text-xs font-bold tracking-widest">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
    </div>
  );
}
