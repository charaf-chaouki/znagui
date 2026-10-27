"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, User, Mail, Phone, MapPin, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const VILLES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "El Jadida",
  "Nador", "Béni Mellal", "Mohammedia", "Autre",
];

export function RegisterForm() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    ville: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError(t("auth.errPwLen"));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t("auth.errPwMatch"));
      return;
    }
    if (!form.terms) {
      setError(t("auth.errTerms"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          ville: form.ville,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t("auth.errCreate"));
        return;
      }
      // Account created + auto-logged in → go to the client space.
      window.location.href = data.redirectTo || "/client";
    } catch {
      setError(t("auth.errConn"));
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background py-2.5 pe-3 ps-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("auth.fullName")}
        </label>
        <div className="relative">
          <User className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder={t("auth.fullNamePh")} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("col.email")}
          </label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="email" type="email" required value={form.email}
              onChange={(e) => set("email", e.target.value)} placeholder={t("auth.emailPh")}
              className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("col.telephone")}
          </label>
          <div className="relative">
            <Phone className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="phone" required value={form.phone}
              onChange={(e) => set("phone", e.target.value)} placeholder="06XXXXXXXX"
              className={inputCls} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="ville" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("col.ville")}
        </label>
        <div className="relative">
          <MapPin className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <select id="ville" required value={form.ville} onChange={(e) => set("ville", e.target.value)}
            className={`${inputCls} appearance-none`}>
            <option value="" disabled>{t("auth.choisirVille")}</option>
            {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("auth.password")}
          </label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="password" type={show ? "text" : "password"} required value={form.password}
              onChange={(e) => set("password", e.target.value)} placeholder="••••••••"
              className={`${inputCls} pe-10`} />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label={show ? t("auth.hide") : t("auth.show")}>
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("auth.confirm")}
          </label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="confirm" type={show ? "text" : "password"} required value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)} placeholder="••••••••"
              className={inputCls} />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--brand)]" />
        <span>
          {t("auth.terms1")}{" "}
          <Link href="/conditions" className="font-medium text-brand hover:underline">
            {t("auth.termsLink")}
          </Link>{" "}
          {t("auth.terms2")}{" "}
          <Link href="/confidentialite" className="font-medium text-brand hover:underline">
            {t("auth.privacyLink")}
          </Link>.
        </span>
      </label>

      <button type="submit" disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("auth.createMyAccount")}
      </button>

      <p className="text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link href="/connexion" className="font-semibold text-brand hover:underline">
          {t("auth.signin")}
        </Link>
      </p>
    </form>
  );
}
