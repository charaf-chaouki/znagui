"use client";

import { useState } from "react";
import { Loader2, KeyRound, AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pe-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={labelCls}>{label} *</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          aria-label={show ? t("common.hide") : t("common.show")}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PasswordForm() {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (next !== confirm) {
      setError(t("pwd.mismatch"));
      return;
    }
    if (next.length < 8) {
      setError(t("pwd.tooShort"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next, confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("pwd.failed"));
        return;
      }
      setSaved(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError(t("pwd.connError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
            <KeyRound className="h-4 w-4" />
          </span>
          {t("pwd.title")}
        </h3>
        <p className="mb-4 text-sm text-muted">{t("pwd.subtitle")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField label={t("pwd.current")} value={current} onChange={setCurrent} autoComplete="current-password" />
          <div className="hidden sm:block" />
          <PasswordField label={t("pwd.new")} value={next} onChange={setNext} autoComplete="new-password" />
          <PasswordField label={t("pwd.confirm")} value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark">
              <Check className="h-4 w-4" /> {t("pwd.updated")}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-dark disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("pwd.submit")}
          </button>
        </div>
      </div>
    </form>
  );
}
