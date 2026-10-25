"use client";

import { useRef, useState } from "react";
import { Upload, FileCheck2, X, Loader2, Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function FileUpload({
  label,
  value,
  onChange,
  accept = "image/*,application/pdf",
  endpoint = "/api/upload",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  endpoint?: string;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Échec de l'envoi.");
        return;
      }
      setName(data.name ?? file.name);
      onChange(data.url);
    } catch {
      setError("Envoi impossible.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-brand/30 bg-brand-light/40 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm text-brand-darker">
            <FileCheck2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{name ?? t("fu.uploaded")}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <a href={value} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-brand-dark hover:bg-brand-light" title={t("fu.view")}>
              <Eye className="h-4 w-4" />
            </a>
            <button type="button" onClick={() => { onChange(null); setName(null); }} className="rounded p-1 text-slate-400 hover:bg-slate-100" title={t("fu.remove")}>
              <X className="h-4 w-4" />
            </button>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500 hover:border-brand hover:text-brand disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? t("fu.uploading") : t("fu.upload")}
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={onSelect} className="hidden" />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
