// Admin dashboard client component
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/preferences/preferences";
import { t } from "@/lib/i18n";
import type { Fabric } from "@/features/catalog/types";
import { adminService, type Order } from "@/features/admin/services/admin";
import { authService } from "@/features/auth/services/auth";
import { ApiError, errorMessage } from "@/lib/api/errors";
import FabricForm from "./FabricForm";

type Tab = "fabrics" | "orders";

const FABRICS_PAGE_SIZE = 100;
const ORDERS_PAGE_SIZE = 50;

export default function AdminDashboard({ email }: { email: string }) {
  const { locale } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("fabrics");
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [fabricPage, setFabricPage] = useState({ page: 1, totalPages: 1 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPage, setOrderPage] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.isUnauthorized) {
      router.push("/admin/login");
      return;
    }
    setError(errorMessage(err, locale));
  }, [router, locale]);

  const loadFabrics = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await adminService.listFabrics(page, FABRICS_PAGE_SIZE);
      setFabrics(result.items);
      setFabricPage({ page: result.page, totalPages: result.totalPages });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadOrders = useCallback(async (page = 1) => {
    try {
      const result = await adminService.listOrders(page, ORDERS_PAGE_SIZE);
      setOrders(result.items);
      setOrderPage({ page: result.page, totalPages: result.totalPages });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  useEffect(() => {
    // Initial data load for the dashboard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFabrics();
    loadOrders();
  }, [loadFabrics, loadOrders]);

  async function logout() {
    await authService.logout().catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }

  async function toggleHide(fabric: Fabric) {
    setError("");
    try {
      await adminService.setVisibility(fabric.id, !fabric.hidden);
      await loadFabrics(fabricPage.page);
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteFabric(id: string) {
    if (!confirm(locale === "ar" ? "حذف هذا القماش؟" : "Delete this fabric?")) return;
    setError("");
    try {
      await adminService.deleteFabric(id);
      await loadFabrics(fabricPage.page);
    } catch (err) {
      handleError(err);
    }
  }

  if (editingFabric || addingNew) {
    return (
      <FabricForm
        fabric={editingFabric}
        onCancel={() => { setEditingFabric(null); setAddingNew(false); }}
        onSaved={() => { setEditingFabric(null); setAddingNew(false); loadFabrics(fabricPage.page); }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Admin header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div className="admin-badge" style={{ marginBottom: "0.5rem" }}>🔒 Admin — Not public</div>
          <h1 style={{ color: "var(--fg)", fontSize: "1.6rem", fontWeight: 400 }}>
            {t(locale, "adminTitle")}
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.82rem" }}>{email}</p>
        </div>
        <button onClick={logout} style={outlineBtn}>{t(locale, "adminLogout")}</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        {(["fabrics", "orders"] as Tab[]).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            style={{
              background: "none",
              border: "none",
              color: tab === t_ ? "var(--gold-light)" : "var(--fg-muted)",
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "0.4rem 0.8rem",
              borderBottom: tab === t_ ? "2px solid var(--gold-light)" : "2px solid transparent",
              transition: "color 0.25s",
            }}
          >
            {t_ === "fabrics" ? t(locale, "adminProducts") : t(locale, "adminOrders")}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: "#e55", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
      )}

      {/* Fabrics tab */}
      {tab === "fabrics" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button onClick={() => setAddingNew(true)} style={goldBtn}>
              + {t(locale, "adminAddProduct")}
            </button>
          </div>
          {loading ? (
            <p style={{ color: "var(--fg-muted)" }}>{t(locale, "loading")}</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Name", "Category", "Material", "Price/m", "Stock", "Hidden", "Actions"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fabrics.map((f) => (
                    <tr key={f.id} style={{ borderBottom: "1px solid var(--border)", opacity: f.hidden ? 0.5 : 1 }}>
                      <td style={td}>{f.nameEn}</td>
                      <td style={td}>{f.categoryLabel.en}</td>
                      <td style={td}>{f.materialLabel.en}</td>
                      <td style={{ ...td, color: f.pricePerMeter > 0 ? "var(--fg-body)" : "#ffa040" }}>
                        {f.pricePerMeter > 0 ? f.pricePerMeter : "Upon inquiry"}
                      </td>
                      <td style={{ ...td, color: f.stockMeters > 0 ? "var(--fg-body)" : "var(--fg-muted)" }}>
                        {f.stockMeters > 0 ? `${f.stockMeters}m` : "By order"}
                      </td>
                      <td style={td}>{f.hidden ? "🙈" : "👁"}</td>
                      <td style={{ ...td, display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button onClick={() => setEditingFabric(f)} style={smallBtn}>{t(locale, "adminEdit")}</button>
                        <button onClick={() => toggleHide(f)} style={smallBtn}>
                          {f.hidden ? t(locale, "adminShow") : t(locale, "adminHide")}
                        </button>
                        <button onClick={() => deleteFabric(f.id)} style={{ ...smallBtn, color: "#e55", borderColor: "#e55" }}>
                          {t(locale, "adminDelete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pager {...fabricPage} onPage={loadFabrics} />
            </div>
          )}
        </>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <p style={{ color: "var(--fg-muted)" }}>{t(locale, "adminNoOrders")}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["ID", "Name", "Total", "Payment", "Date", "Status"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={td}>{o.id.slice(0, 12)}…</td>
                    <td style={td}>{o.name}</td>
                    <td style={td}>{o.total > 0 ? o.total.toFixed(2) : "—"}</td>
                    <td style={td}>{o.paymentMethod}</td>
                    <td style={td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...td, color: "#ffa040" }}>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pager {...orderPage} onPage={loadOrders} />
        </div>
      )}
    </div>
  );
}

/** Only rendered when there is more than one page. */
function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
      <button style={smallBtn} disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
      <span style={{ color: "var(--fg-muted)", fontSize: "0.8rem" }}>{page} / {totalPages}</span>
      <button style={smallBtn} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "start",
  color: "var(--fg-muted)",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  padding: "0.5rem 0.75rem",
};

const td: React.CSSProperties = {
  color: "var(--fg-body)",
  padding: "0.6rem 0.75rem",
  verticalAlign: "middle",
};

const goldBtn: React.CSSProperties = {
  background: "var(--btn-bg)",
  color: "var(--btn-fg)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "0.6rem 1.25rem",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.85rem",
};

const outlineBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  color: "var(--fg-muted)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const smallBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  color: "var(--fg-muted)",
  borderRadius: "var(--radius-sm)",
  padding: "0.25rem 0.6rem",
  cursor: "pointer",
  fontSize: "0.75rem",
};
