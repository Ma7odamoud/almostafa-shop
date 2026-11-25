// Admin layout — not linked from customer nav
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Al-Mostafa (Not public)",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg)",
    }}>
      {children}
    </div>
  );
}
