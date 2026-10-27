"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, User, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function LoginForm() {
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("auth.errInvalid"));
        return;
      }
      // Redirect to the role's space.
      window.location.href = data.redirectTo || "/";
    } catch {
      setError(t("auth.errConn"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("auth.identifier")}
        </label>
        <div className="relative">
          <User className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t("auth.identifierPh")}
            className="w-full rounded-lg border border-border bg-background py-2.5 pe-3 ps-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("auth.password")}
        </label>
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-background py-2.5 pe-10 ps-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label={show ? t("auth.hide") : t("auth.show")}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-muted">
          <input type="checkbox" className="h-4 w-4 rounded border-border accent-[var(--brand)]" />
          {t("auth.remember")}
        </label>
        <Link href="/mot-de-passe-oublie" className="font-medium text-brand hover:underline">
          {t("auth.forgot")}
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("auth.signin")}
      </button>

      <p className="text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <Link href="/inscription" className="font-semibold text-brand hover:underline">
          {t("auth.createAccount")}
        </Link>
      </p>
    </form>
  );
}
