"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, User, Mail, Phone, MapPin, Lock } from "lucide-react";

const VILLES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "El Jadida",
  "Nador", "Béni Mellal", "Mohammedia", "Autre",
];

export function RegisterForm() {
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
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!form.terms) {
      setError("Veuillez accepter les conditions d'utilisation.");
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
        setError(data.message || "Impossible de créer le compte. Vérifiez vos informations.");
        return;
      }
      // Account created + auto-logged in → go to the client space.
      window.location.href = data.redirectTo || "/client";
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          Nom complet
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Votre nom complet" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="email" type="email" required value={form.email}
              onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.ma"
              className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="phone" required value={form.phone}
              onChange={(e) => set("phone", e.target.value)} placeholder="06XXXXXXXX"
              className={inputCls} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="ville" className="mb-1.5 block text-sm font-medium text-foreground">
          Ville
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <select id="ville" required value={form.ville} onChange={(e) => set("ville", e.target.value)}
            className={`${inputCls} appearance-none`}>
            <option value="" disabled>Choisissez votre ville</option>
            {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input id="password" type={show ? "text" : "password"} required value={form.password}
              onChange={(e) => set("password", e.target.value)} placeholder="••••••••"
              className={`${inputCls} pr-10`} />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label={show ? "Masquer" : "Afficher"}>
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-foreground">
            Confirmer
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
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
          J'accepte les{" "}
          <Link href="/conditions" className="font-medium text-brand hover:underline">
            conditions d'utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="font-medium text-brand hover:underline">
            politique de confidentialité
          </Link>.
        </span>
      </label>

      <button type="submit" disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-dark disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Créer mon compte
      </button>

      <p className="text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-brand hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
