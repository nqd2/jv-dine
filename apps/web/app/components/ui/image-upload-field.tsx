"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { validateImageFile } from "@lib/upload-api";

export type ImageUploadFieldProps = {
  /** URL already stored on the server (edit mode). */
  remoteUrl: string;
  /** Locally selected file; uploaded only when the parent form submits. */
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
  disabled?: boolean;
  label: string;
  hint: string;
  typesHint: string;
  /** Label for the explicit file-picker button. */
  browseLabel?: string;
  accentClass?: string;
};

function imageFileFromList(files: FileList | null | undefined): File | null {
  if (!files?.length) {
    return null;
  }
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      return file;
    }
  }
  return null;
}

function imageFileFromClipboard(
  clipboard: DataTransfer | null | undefined,
): File | null {
  if (!clipboard) {
    return null;
  }
  const fromFiles = imageFileFromList(clipboard.files);
  if (fromFiles) {
    return fromFiles;
  }
  for (const item of clipboard.items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        return file;
      }
    }
  }
  return null;
}

export function ImageUploadField({
  remoteUrl,
  pendingFile,
  onPendingFileChange,
  disabled = false,
  label,
  hint,
  typesHint,
  browseLabel = "Browse",
  accentClass = "text-primary",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (pendingFile) {
      return URL.createObjectURL(pendingFile);
    }
    return remoteUrl.trim() || null;
  }, [pendingFile, remoteUrl]);

  useEffect(() => {
    if (!pendingFile || !previewUrl?.startsWith("blob:")) {
      return;
    }
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [pendingFile, previewUrl]);

  const handlePick = useCallback(
    (file: File) => {
      setError("");
      try {
        validateImageFile(file);
        onPendingFileChange(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid image");
        onPendingFileChange(null);
      }
    },
    [onPendingFileChange],
  );

  const onPaste = useCallback(
    (event: ClipboardEvent) => {
      if (disabled) {
        return;
      }
      const file = imageFileFromClipboard(event.clipboardData);
      if (!file) {
        return;
      }
      event.preventDefault();
      handlePick(file);
    },
    [disabled, handlePick],
  );

  useEffect(() => {
    const zone = dropZoneRef.current;
    if (!zone || disabled) {
      return;
    }
    zone.addEventListener("paste", onPaste);
    return () => zone.removeEventListener("paste", onPaste);
  }, [disabled, onPaste]);

  function openFilePicker() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function clearPending() {
    setError("");
    onPendingFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-label">
        <ImagePlus className="size-4 shrink-0" aria-hidden />
        {label}
      </p>
      <div
        ref={dropZoneRef}
        tabIndex={disabled ? -1 : 0}
        role="group"
        aria-label={label}
        aria-disabled={disabled || undefined}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onClick={() => {
          dropZoneRef.current?.focus();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const related = event.relatedTarget as Node | null;
          if (!related || !dropZoneRef.current?.contains(related)) {
            setIsDragging(false);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) {
            event.dataTransfer.dropEffect = "copy";
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
          if (disabled) {
            return;
          }
          const file = imageFileFromList(event.dataTransfer.files);
          if (file) {
            handlePick(file);
          }
        }}
        className={[
          "flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed bg-white px-8 py-8 outline-none transition-colors",
          disabled
            ? "pointer-events-none opacity-60"
            : "cursor-pointer hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border-input",
        ].join(" ")}
      >
        {previewUrl ? (
          <div className="relative h-40 w-full max-w-md overflow-hidden rounded-lg">
            <Image
              src={previewUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <ImagePlus className={`size-12 ${accentClass}`} aria-hidden />
        )}
        <span className="text-center text-base font-medium text-subtitle">
          {hint}
        </span>
        <span className="text-center text-sm font-medium text-caption">
          {typesHint}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            openFilePicker();
          }}
          className="mt-1 rounded-lg border border-border-input bg-muted-surface px-4 py-2 text-sm font-medium text-label transition-colors hover:border-primary hover:text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {browseLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              handlePick(file);
            }
            event.target.value = "";
          }}
        />
      </div>
      {pendingFile ? (
        <p className="mt-2 text-sm text-caption">
          {pendingFile.name}
          {!disabled ? (
            <button
              type="button"
              className="ml-2 font-medium text-primary underline-offset-2 hover:underline"
              onClick={clearPending}
            >
              ×
            </button>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>
      ) : null}
    </div>
  );
}
