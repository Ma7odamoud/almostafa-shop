// Admin dashboard — private, server-side auth check
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  // Server-side auth check — not just hiding buttons
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient email={session.email} />;
}
