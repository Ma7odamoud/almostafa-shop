// Admin login page
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLang } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function AdminLoginPage() {
  const { locale } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      backgroundColor: "var(--bg)",
    }}>
      {/* Admin label — clearly not customer-facing */}
      <div className="admin-badge" style={{ marginBottom: "1.5rem" }}>
        🔒 Admin Area — Not public
      </div>

      <div style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem",
        width: "100%",
        maxWidth: 400,
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Image src="/logo-dark.jpg" alt="Al-Mostafa" width={160} height={64} style={{ objectFit: "contain" }} />
          <h1 style={{ color: "var(--fg)", fontSize: "1.1rem", fontWeight: 400, marginTop: "1rem" }}>
            {t(locale, "adminLogin")}
          </h1>
        </div>

        {/* Setup reminder */}
        <div style={{
          background: "rgba(180,80,0,0.12)",
          border: "1px solid rgba(180,80,0,0.3)",
          borderRadius: "var(--radius-sm)",
          padding: "0.75rem 1rem",
          color: "#ffa040",
          fontSize: "0.78rem",
          marginBottom: "1.5rem",
          lineHeight: 1.6,
        }}>
          ⚠️ {locale === "ar"
            ? "يرجى ضبط ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env.local قبل الاستخدام."
            : "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before first use."}
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>{t(locale, "adminEmail")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              autoComplete="username"
            />
          </div>
          <div>
            <label style={labelStyle}>{t(locale, "adminPassword")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p style={{ color: "#e55", fontSize: "0.82rem", textAlign: "center" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, var(--gold-mid), var(--gold-light))",
              color: "var(--navy-deep)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.85rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              letterSpacing: "0.06em",
            }}
          >
            {loading ? t(locale, "loading") : t(locale, "adminLoginBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--fg-muted)",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "0.3rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--fg-body)",
  borderRadius: "var(--radius-sm)",
  padding: "0.6rem 0.75rem",
  fontSize: "0.9rem",
};
